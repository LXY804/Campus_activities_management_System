const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

const registrationStatusExpr = `
  CASE ua.apply_status
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    WHEN 2 THEN 'rejected'
    WHEN 3 THEN 'cancelled'
    ELSE 'pending'
  END
`

const eventStatusExpr = `
  CASE
    WHEN NOW() < a.start_time THEN 'upcoming'
    WHEN NOW() BETWEEN a.start_time AND a.end_time THEN 'open'
    ELSE 'ended'
  END
`

const statusMap = {
  pending: 0,
  approved: 1,
  rejected: 2,
  cancelled: 3
}

exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id
    const { status, page = 1, pageSize = 10 } = req.query

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)

    let whereClause = 'WHERE ua.user_id = ?'
    const replacements = [userId]

    if (status && typeof statusMap[status] !== 'undefined') {
      whereClause += ' AND ua.apply_status = ?'
      replacements.push(statusMap[status])
    }

    const listSql = `
      SELECT 
        ua.apply_id AS registration_id,
        ${registrationStatusExpr} AS registration_status,
        ua.applied_at,
        a.activity_id AS event_id,
        a.activity_code AS event_code,
        a.activity_name AS event_title,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        a.type_id,
        ${eventStatusExpr} AS event_status,
        COALESCE(a.cover_image, '') AS cover_url,
        -- 是否已评论：1 表示已评论，0 表示未评论
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM activity_comments ac 
            WHERE ac.activity_id = a.activity_id 
              AND ac.user_id = ua.user_id
          ) THEN 1 
          ELSE 0 
        END AS has_comment,
        u.username AS organizer_name
      FROM user_activity_apply ua
      INNER JOIN activities a ON ua.activity_id = a.activity_id
      LEFT JOIN users u ON a.organizer_id = u.user_id
      ${whereClause}
      ORDER BY ua.applied_at DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM user_activity_apply ua
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
    console.error('获取我的报名列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const sql = `
      SELECT apply_id, apply_status
      FROM user_activity_apply
      WHERE apply_id = ? AND user_id = ?
    `
    const [registration] = await sequelize.query(sql, {
      replacements: [id, userId],
      type: QueryTypes.SELECT
    })

    if (!registration) {
      return error(res, '报名记录不存在', 404)
    }

    if (registration.apply_status === 3) {
      return error(res, '报名已取消', 400)
    }

    const updateSql = `
      UPDATE user_activity_apply
      SET apply_status = 3
      WHERE apply_id = ?
    `
    await sequelize.query(updateSql, {
      replacements: [id],
      type: QueryTypes.UPDATE
    })

    success(res, null, '取消报名成功')
  } catch (err) {
    console.error('取消报名错误:', err)
    error(res, '服务器错误', 500)
  }
}
