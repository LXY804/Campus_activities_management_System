const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

// 报名状态映射：0:待审核, 1:通过, 2:拒绝, 3:取消
const statusMap = {
  pending: 0,
  approved: 1,
  rejected: 2,
  cancelled: 3
}

const statusExpr = `
  CASE ua.apply_status
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    WHEN 2 THEN 'rejected'
    WHEN 3 THEN 'cancelled'
    ELSE 'pending'
  END
`

// 获取当前组织者发布的活动及报名统计
exports.getMyActivities = async (req, res) => {
  try {
    const organizerId = req.user.id

    const sql = `
      SELECT 
        a.activity_id AS id,
        a.activity_name AS title,
        a.location,
        a.start_time,
        a.end_time,
        a.capacity,
        c.college_name AS target_college_name,
        -- 报名统计
        COUNT(ua.apply_id) AS total_applications,
        SUM(CASE WHEN ua.apply_status = 0 THEN 1 ELSE 0 END) AS pending_applications,
        SUM(CASE WHEN ua.apply_status = 1 THEN 1 ELSE 0 END) AS approved_applications
      FROM activities a
      LEFT JOIN user_activity_apply ua ON ua.activity_id = a.activity_id
      LEFT JOIN colleges c ON a.target_college_id = c.college_id
      WHERE a.organizer_id = ?
      GROUP BY a.activity_id
      ORDER BY a.start_time DESC
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

// 获取某个活动的报名列表（仅限当前组织者的活动）
exports.getActivityApplications = async (req, res) => {
  try {
    const organizerId = req.user.id
    const { id } = req.params // activity_id

    const sql = `
      SELECT 
        ua.apply_id AS id,
        ua.user_id,
        u.username AS user_name,
        ua.applied_at AS apply_time,
        ua.apply_status,
        ${statusExpr} AS status
      FROM user_activity_apply ua
      INNER JOIN users u ON ua.user_id = u.user_id
      INNER JOIN activities a ON ua.activity_id = a.activity_id
      WHERE ua.activity_id = ?
        AND a.organizer_id = ?
      ORDER BY ua.applied_at DESC
    `

    const list = await sequelize.query(sql, {
      replacements: [id, organizerId],
      type: QueryTypes.SELECT
    })

    success(res, list)
  } catch (err) {
    console.error('获取活动报名列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 更新报名状态（通过 / 拒绝 / 取消）
exports.updateApplicationStatus = async (req, res) => {
  try {
    const organizerId = req.user.id
    const { id } = req.params // apply_id
    const { status } = req.body

    if (!Object.prototype.hasOwnProperty.call(statusMap, status)) {
      return error(res, '无效的状态值', 400)
    }

    // 先确认这条报名属于当前组织者的活动
    const selectSql = `
      SELECT 
        ua.apply_id,
        ua.apply_status,
        ua.activity_id,
        a.capacity,
        (
          SELECT COUNT(*)
          FROM user_activity_apply x
          WHERE x.activity_id = ua.activity_id
            AND x.apply_status = 1
        ) AS approved_count
      FROM user_activity_apply ua
      INNER JOIN activities a ON ua.activity_id = a.activity_id
      WHERE ua.apply_id = ?
        AND a.organizer_id = ?
    `

    const [apply] = await sequelize.query(selectSql, {
      replacements: [id, organizerId],
      type: QueryTypes.SELECT
    })

    if (!apply) {
      return error(res, '报名记录不存在', 404)
    }

    // 如果是通过，需要检查容量
    if (status === 'approved' && apply.capacity && apply.approved_count >= apply.capacity) {
      return error(res, '已超出活动容量，无法再通过申请', 400)
    }

    const updateSql = `
      UPDATE user_activity_apply
      SET apply_status = ?
      WHERE apply_id = ?
    `

    await sequelize.query(updateSql, {
      replacements: [statusMap[status], id],
      type: QueryTypes.UPDATE
    })

    success(res, null, '操作成功')
  } catch (err) {
    console.error('更新报名状态错误:', err)
    error(res, '服务器错误', 500)
  }
}



