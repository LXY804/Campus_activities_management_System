const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')

exports.submitComment = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id
    const { rating, content } = req.body

    if (!rating || !content) {
      return error(res, '评分和评论内容不能为空', 400)
    }

    if (rating < 1 || rating > 5) {
      return error(res, '评分必须在1-5之间', 400)
    }

    const eventSql = 'SELECT activity_id FROM activities WHERE activity_id = ?'
    const [event] = await sequelize.query(eventSql, {
      replacements: [eventId],
      type: QueryTypes.SELECT
    })

    if (!event) {
      return error(res, '活动不存在', 404)
    }

    const registrationSql = `
      SELECT apply_id 
      FROM user_activity_apply 
      WHERE activity_id = ? AND user_id = ? AND apply_status = 1
    `
    const [registration] = await sequelize.query(registrationSql, {
      replacements: [eventId, userId],
      type: QueryTypes.SELECT
    })

    if (!registration) {
      return error(res, '您未参与此活动，无法评论', 403)
    }

    const existingSql = `
      SELECT comment_id FROM activity_comments WHERE activity_id = ? AND user_id = ?
    `
    const [existing] = await sequelize.query(existingSql, {
      replacements: [eventId, userId],
      type: QueryTypes.SELECT
    })

    if (existing) {
      return error(res, '您已评论过此活动', 400)
    }

    const insertSql = `
      INSERT INTO activity_comments (activity_id, user_id, rating, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `
    const [commentId] = await sequelize.query(insertSql, {
      replacements: [parseInt(eventId, 10), userId, parseInt(rating, 10), content],
      type: QueryTypes.INSERT
    })

    const getSql = `
      SELECT 
        comment_id,
        activity_id,
        user_id,
        rating,
        content,
        created_at,
        username,
        event_title,
        location,
        start_time,
        status
      FROM v_activity_comments
      WHERE comment_id = ?
    `
    const [comment] = await sequelize.query(getSql, {
      replacements: [commentId],
      type: QueryTypes.SELECT
    })

    success(res, comment, '评论提交成功')
  } catch (err) {
    console.error('提交评论错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params
    const { page = 1, pageSize = 10 } = req.query

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)

    const listSql = `
      SELECT 
        comment_id AS id,
        rating,
        content,
        created_at,
        status,
        username
      FROM v_activity_comments
      WHERE activity_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM activity_comments
      WHERE activity_id = ?
    `

    const [countResult] = await sequelize.query(countSql, {
      replacements: [eventId],
      type: QueryTypes.SELECT
    })

    const list = await sequelize.query(listSql, {
      replacements: [eventId, limit, offset],
      type: QueryTypes.SELECT
    })

    success(res, {
      list,
      total: countResult.total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10)
    })
  } catch (err) {
    console.error('获取评论列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.getMyComments = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, pageSize = 10 } = req.query

    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)

    const listSql = `
      SELECT 
        comment_id AS id,
        rating,
        content,
        created_at,
        status,
        activity_id AS event_id,
        event_title,
        location,
        start_time
      FROM v_activity_comments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `

    const countSql = `
      SELECT COUNT(*) AS total
      FROM activity_comments
      WHERE user_id = ?
    `

    const [countResult] = await sequelize.query(countSql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })

    const list = await sequelize.query(listSql, {
      replacements: [userId, limit, offset],
      type: QueryTypes.SELECT
    })

    success(res, {
      list,
      total: countResult.total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10)
    })
  } catch (err) {
    console.error('获取我的评论错误:', err)
    error(res, '服务器错误', 500)
  }
}
