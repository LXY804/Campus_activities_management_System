const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

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

    let whereClause = 'WHERE user_id = ?'
    const replacements = [userId]

    if (status && typeof statusMap[status] !== 'undefined') {
      whereClause += ' AND apply_status = ?'
      replacements.push(statusMap[status])
    }

    const listSql = `
      SELECT 
        registration_id,
        registration_status,
        applied_at,
        event_id,
        event_code,
        event_title,
        location,
        start_time,
        end_time,
        capacity,
        event_status,
        organizer_name
      FROM v_user_registrations
      ${whereClause}
      ORDER BY applied_at DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM v_user_registrations
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
