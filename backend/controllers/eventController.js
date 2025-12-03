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

// 工具函数：根据活动类型名称查找或回退到默认 type_id
const getTypeIdByName = async (typeName) => {
  if (!typeName) return 1

  const sql = 'SELECT type_id FROM activity_types WHERE type_name = ? LIMIT 1'
  const [row] = await sequelize.query(sql, {
    replacements: [typeName],
    type: QueryTypes.SELECT
  })

  return row?.type_id || 1
}

// 工具函数：根据学院名称查找 college_id（找不到则返回 null）
const getCollegeIdByName = async (collegeName) => {
  if (!collegeName) return null

  const sql = 'SELECT college_id FROM colleges WHERE college_name = ? LIMIT 1'
  const [row] = await sequelize.query(sql, {
    replacements: [collegeName],
    type: QueryTypes.SELECT
  })

  return row?.college_id || null
}

// 生成活动编码
const generateActivityCode = () => {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const ts = now.getTime().toString().slice(-4)
  return `ACT${y}${m}${d}${ts}`
}

// 组织者创建活动（提交审核）
exports.createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id
    const {
      title,
      description,
      activityType,
      belongCollege,
      location,
      startTime,
      endTime,
      maxParticipants
    } = req.body

    if (!title || !activityType || !startTime || !endTime) {
      return error(res, '请完善必填字段：活动名称、类型、开始时间、结束时间', 400)
    }

    const typeId = await getTypeIdByName(activityType)
    const targetCollegeId = await getCollegeIdByName(belongCollege)

    const activityCode = generateActivityCode()

    // 创建活动
    const insertActivitySql = `
      INSERT INTO activities (
        activity_name,
        activity_code,
        Activity_description,
        type_id,
        start_time,
        end_time,
        location,
        target_college_id,
        capacity,
        organizer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [activityId] = await sequelize.query(insertActivitySql, {
      replacements: [
        title,
        activityCode,
        description || '',
        typeId,
        startTime,
        endTime,
        location || '',
        targetCollegeId,
        Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : 0,
        organizerId
      ],
      type: QueryTypes.INSERT
    })

    // 写入审核队列表，默认待审核 admin_check = 0
    const insertCreationSql = `
      INSERT INTO organizer_activity_creation (organizer_id, activity_id, admin_check, check_remark)
      VALUES (?, ?, 0, NULL)
    `

    await sequelize.query(insertCreationSql, {
      replacements: [organizerId, activityId],
      type: QueryTypes.INSERT
    })

    success(
      res,
      {
        id: activityId,
        code: activityCode,
        title,
        type_id: typeId,
        location,
        start_time: startTime,
        end_time: endTime
      },
      '活动已提交审核'
    )
  } catch (err) {
    console.error('创建活动错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.getEventList = async (req, res) => {
  try {
    const { status, category_id, page = 1, pageSize = 10 } = req.query

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)

    let whereClause = 'WHERE 1=1'
    const replacements = []

    if (status) {
      whereClause += ' AND status = ?'
      replacements.push(status)
    }

    if (category_id) {
      whereClause += ' AND type_id = ?'
      replacements.push(category_id)
    }

    const listSql = `
      SELECT 
        id,
        code,
        title,
        description,
        location,
        start_time,
        end_time,
        capacity,
        type_id,
        status,
        organizer_name,
        target_college_name,
        signed_up
      FROM v_activity_overview
      ${whereClause}
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM v_activity_overview
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
        id,
        code,
        title,
        description,
        location,
        start_time,
        end_time,
        capacity,
        type_id,
        status,
        organizer_name,
        target_college_name,
        signed_up
      FROM v_activity_overview
      WHERE id = ?
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

    // 检查用户信息是否完善
    const userInfoSql = `
      SELECT user_id, student_id, real_name, college_id
      FROM users
      WHERE user_id = ?
    `
    const [userInfo] = await sequelize.query(userInfoSql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })

    if (!userInfo) {
      return error(res, '用户不存在', 404)
    }

    // 检查必要信息是否完善（学号、真实姓名、学院）
    const missingFields = []
    if (!userInfo.student_id) missingFields.push('学号')
    if (!userInfo.real_name) missingFields.push('真实姓名')
    if (!userInfo.college_id) missingFields.push('学院')

    if (missingFields.length > 0) {
      return error(res, `请先完善个人信息：${missingFields.join('、')}`, 400, {
        requiresProfileCompletion: true,
        missingFields: missingFields
      })
    }

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

// 管理员获取待审核活动列表
exports.getPendingEventsForAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT
        oac.creation_id,
        a.activity_id AS id,
        a.activity_code AS code,
        a.activity_name AS title,
        a.Activity_description AS description,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        a.type_id,
        u.username AS organizer_name,
        c.college_name AS organizer_college,
        oac.created_at AS submitted_at
      FROM organizer_activity_creation oac
      INNER JOIN activities a ON oac.activity_id = a.activity_id
      INNER JOIN users u ON oac.organizer_id = u.user_id
      LEFT JOIN colleges c ON u.college_id = c.college_id
      WHERE oac.admin_check = 0
      ORDER BY oac.created_at DESC
    `

    const list = await sequelize.query(sql, { type: QueryTypes.SELECT })

    success(res, list)
  } catch (err) {
    console.error('获取待审核活动列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员审核通过活动
exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params // creation_id

    const checkSql = `
      SELECT creation_id, activity_id, admin_check
      FROM organizer_activity_creation
      WHERE creation_id = ?
    `

    const [record] = await sequelize.query(checkSql, {
      replacements: [id],
      type: QueryTypes.SELECT
    })

    if (!record) {
      return error(res, '审核记录不存在', 404)
    }

    if (record.admin_check === 1) {
      return success(res, null, '该活动已审核通过')
    }

    const updateSql = `
      UPDATE organizer_activity_creation
      SET admin_check = 1, check_remark = NULL
      WHERE creation_id = ?
    `

    await sequelize.query(updateSql, {
      replacements: [id],
      type: QueryTypes.UPDATE
    })

    success(res, null, '活动审核通过')
  } catch (err) {
    console.error('审核通过活动错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员驳回活动
exports.rejectEvent = async (req, res) => {
  try {
    const { id } = req.params // creation_id
    const { remark } = req.body

    const checkSql = `
      SELECT creation_id, activity_id, admin_check
      FROM organizer_activity_creation
      WHERE creation_id = ?
    `

    const [record] = await sequelize.query(checkSql, {
      replacements: [id],
      type: QueryTypes.SELECT
    })

    if (!record) {
      return error(res, '审核记录不存在', 404)
    }

    if (record.admin_check === 2) {
      return success(res, null, '该活动已被驳回')
    }

    const updateSql = `
      UPDATE organizer_activity_creation
      SET admin_check = 2, check_remark = ?
      WHERE creation_id = ?
    `

    await sequelize.query(updateSql, {
      replacements: [remark || null, id],
      type: QueryTypes.UPDATE
    })

    success(res, null, '活动已驳回')
  } catch (err) {
    console.error('驳回活动错误:', err)
    error(res, '服务器错误', 500)
  }
}

