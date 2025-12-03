const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

const eventStatusExpr = `
  CASE
    WHEN NOW() < a.start_time THEN 'upcoming'
    WHEN NOW() BETWEEN a.start_time AND a.end_time THEN 'open'
    ELSE 'ended'
  END
`

const registrationStatusExpr = `
  CASE ua.apply_status
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    WHEN 2 THEN 'rejected'
    WHEN 3 THEN 'cancelled'
    ELSE 'pending'
  END
`

exports.getEventList = async (req, res) => {
  try {
    const { status, category_id, page = 1, pageSize = 10 } = req.query

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)

    let whereClause = 'WHERE 1=1'
    const replacements = []

    if (status) {
      whereClause += ` AND ${eventStatusExpr} = ?`
      replacements.push(status)
    }

    if (category_id) {
      whereClause += ' AND a.type_id = ?'
      replacements.push(category_id)
    }

    const listSql = `
      SELECT 
        a.activity_id AS id,
        a.activity_code AS code,
        a.activity_name AS title,
        a.Activity_description AS description,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        a.type_id,
        ${eventStatusExpr} AS status,
        u.username AS organizer_name,
        c.college_name AS target_college_name,
        (SELECT COUNT(*) FROM user_activity_apply ua 
          WHERE ua.activity_id = a.activity_id 
            AND ua.apply_status IN (0, 1)) AS signed_up
      FROM activities a
      LEFT JOIN users u ON a.organizer_id = u.user_id
      LEFT JOIN colleges c ON a.target_college_id = c.college_id
      ${whereClause}
      ORDER BY a.start_time DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM activities a
      ${whereClause}
    `

    const [countResult] = await sequelize.query(countSql, {
      replacements,
      type: QueryTypes.SELECT
    })

    const list = await sequelize.query(listSql, {
      replacements: [...replacements, limit, offset],
      type: QueryTypes.SELECT
    })

    success(res, {
      list,
      total: countResult.total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10)
    })
  } catch (err) {
    console.error('获取活动列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.getEventDetail = async (req, res) => {
  try {
    const { id } = req.params

    const sql = `
      SELECT 
        a.activity_id AS id,
        a.activity_code AS code,
        a.activity_name AS title,
        a.Activity_description AS description,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        a.type_id,
        ${eventStatusExpr} AS status,
        u.username AS organizer_name,
        c.college_name AS target_college_name,
        (SELECT COUNT(*) FROM user_activity_apply ua 
          WHERE ua.activity_id = a.activity_id 
            AND ua.apply_status IN (0, 1)) AS signed_up
      FROM activities a
      LEFT JOIN users u ON a.organizer_id = u.user_id
      LEFT JOIN colleges c ON a.target_college_id = c.college_id
      WHERE a.activity_id = ?
    `

    const [event] = await sequelize.query(sql, {
      replacements: [id],
      type: QueryTypes.SELECT
    })

    if (!event) {
      return error(res, '活动不存在', 404)
    }

    success(res, event)
  } catch (err) {
    console.error('获取活动详情错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.registerEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const eventSql = `
      SELECT activity_id AS id, capacity, start_time, end_time
      FROM activities
      WHERE activity_id = ?
    `
    const [event] = await sequelize.query(eventSql, {
      replacements: [id],
      type: QueryTypes.SELECT
    })

    if (!event) {
      return error(res, '活动不存在', 404)
    }

    const now = new Date()
    // 规则调整：活动开始后不再允许报名（不再使用 end_time 判断结束）
    if (event.start_time && new Date(event.start_time) <= now) {
      return error(res, '活动已开始，无法报名', 400)
    }

    const existingSql = `
      SELECT apply_id FROM user_activity_apply 
      WHERE activity_id = ? AND user_id = ? AND apply_status IN (0, 1)
    `
    const [existing] = await sequelize.query(existingSql, {
      replacements: [id, userId],
      type: QueryTypes.SELECT
    })

    if (existing) {
      return error(res, '您已报名此活动', 400)
    }

    if (event.capacity) {
      const countSql = `
        SELECT COUNT(*) AS count
        FROM user_activity_apply
        WHERE activity_id = ? AND apply_status IN (0, 1)
      `
      const [count] = await sequelize.query(countSql, {
        replacements: [id],
        type: QueryTypes.SELECT
      })

      if (count.count >= event.capacity) {
        return error(res, '活动已满员', 400)
      }
    }

    const insertSql = `
      INSERT INTO user_activity_apply (activity_id, user_id, apply_status, applied_at)
      VALUES (?, ?, 0, NOW())
    `
    const [registrationId] = await sequelize.query(insertSql, {
      replacements: [id, userId],
      type: QueryTypes.INSERT
    })

    const selectSql = `
      SELECT 
        ua.apply_id AS registration_id,
        ua.activity_id AS event_id,
        ua.user_id,
        ${registrationStatusExpr} AS registration_status,
        ua.applied_at
      FROM user_activity_apply ua
      WHERE ua.apply_id = ?
    `

    const [registration] = await sequelize.query(selectSql, {
      replacements: [registrationId],
      type: QueryTypes.SELECT
    })

    success(res, registration, '报名成功，等待审核')
  } catch (err) {
    console.error('报名错误:', err)
    error(res, '服务器错误', 500)
  }
}

