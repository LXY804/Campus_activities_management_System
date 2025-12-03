const { verifyToken } = require('../utils/jwt')
const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { error } = require('../utils/response')

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return error(res, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return error(res, '认证令牌无效', 401)
    }

    const sql = `
      SELECT 
        user_id AS id,
        username,
        role
      FROM users
      WHERE user_id = ?
    `
    const [user] = await sequelize.query(sql, {
      replacements: [decoded.userId],
      type: QueryTypes.SELECT
    })

    if (!user) {
      return error(res, '用户不存在或已被禁用', 401)
    }

    req.user = user
    next()
  } catch (err) {
    return error(res, '认证失败', 401)
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, '未认证', 401)
    }

    if (!roles.includes(req.user.role)) {
      return error(res, '权限不足', 403)
    }

    next()
  }
}

module.exports = { authenticate, authorize }




