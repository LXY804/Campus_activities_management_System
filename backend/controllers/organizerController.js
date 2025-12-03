const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

// 组织者获取自己创建的活动及审核状态
exports.getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user.id

    const sql = `
      SELECT
        oac.creation_id,
        oac.admin_check,
        oac.created_at,
        a.activity_id AS id,
        a.activity_code AS code,
        a.activity_name AS title,
        a.Activity_description AS description,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        at.type_name AS activity_type,
        c.college_name AS belong_college
      FROM organizer_activity_creation oac
      INNER JOIN activities a ON oac.activity_id = a.activity_id
      LEFT JOIN activity_types at ON a.type_id = at.type_id
      LEFT JOIN colleges c ON a.target_college_id = c.college_id
      WHERE oac.organizer_id = ?
      ORDER BY oac.created_at DESC
    `

    const list = await sequelize.query(sql, {
      replacements: [organizerId],
      type: QueryTypes.SELECT
    })

    success(res, list)
  } catch (err) {
    console.error('获取组织者活动列表错误:', err)
    error(res, '服务器错误', 500)
  }
}


