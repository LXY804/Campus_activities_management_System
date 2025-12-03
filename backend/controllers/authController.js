const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { generateToken } = require('../utils/jwt')
const { success, error } = require('../utils/response')

exports.login = async (req, res) => {
  try {
    const { userId, password, role } = req.body

    if (!userId || !password) {
      return error(res, '用户ID和密码不能为空', 400)
    }

    // 验证 userId 是否为数字
    const userIdNum = parseInt(userId, 10)
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return error(res, '用户ID必须是有效的数字', 400)
    }

    const sql = `
      SELECT 
        user_id AS id,
        username,
        password AS password_hash,
        role,
        email,
        phone,
        college_id
      FROM users
      WHERE user_id = ?
    `
    const [user] = await sequelize.query(sql, {
      replacements: [userIdNum],
      type: QueryTypes.SELECT
    })

    // 用户不存在
    if (!user) {
      return error(res, '该用户暂未注册', 401)
    }
    
    // 角色验证
    if (role && user.role !== role) {
      return error(res, '身份验证失败，请选择正确的身份', 403)
    }

    // 密码错误
    if (password !== user.password_hash) {
      return error(res, '账号或密码错误', 401)
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    })

    success(
      res,
      {
        token,
        userId: user.id,
        username: user.username,
        role: user.role
      },
      '登录成功'
    )
  } catch (err) {
    console.error('登录错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.register = async (req, res) => {
  try {
    const { username, phone, password, role, email, collegeId } = req.body
    console.log('注册请求体:', req.body)

    if (!username || !password) {
      return error(res, '请填写用户名和密码', 400)
    }

    if (password.length < 6) {
      return error(res, '密码长度不少于6位', 400)
    }

    const checkSql = 'SELECT user_id FROM users WHERE username = ?'
    const [existing] = await sequelize.query(checkSql, {
      replacements: [username],
      type: QueryTypes.SELECT
    })

    if (existing) {
      return error(res, '用户名已存在', 400)
    }

    const allowedRoles = ['student', 'organizer', 'admin']
    const userRole = allowedRoles.includes(role) ? role : 'student'

    const insertUserSql = `
      INSERT INTO users (username, phone, email, college_id, password, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `
    const [userId] = await sequelize.query(insertUserSql, {
      replacements: [username, phone, email || null, collegeId || null, password, userRole],
      type: QueryTypes.INSERT
    })

    const token = generateToken({
      userId,
      username,
      role: userRole
    })

    success(
      res,
      {
        token,
        userId,
        username,
        role: userRole
      },
      '注册成功',
      201
    )
  } catch (err) {
    console.error('注册错误:', err)
    error(res, '服务器错误', 500)
  }
}

exports.registerByQuery = (req, res) => {
  req.body = {
    username: req.query.username,
    phone: req.query.phone,
    password: req.query.password,
    role: req.query.role,
    email: req.query.email,
    collegeId: req.query.collegeId
  }
  return exports.register(req, res)
}

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id

    const sql = `
      SELECT 
        u.user_id AS id,
        u.username,
        u.role,
        u.email,
        u.phone,
        u.college_id,
        u.student_id,
        u.real_name,
        u.gender,
        u.id_type,
        u.id_number,
        u.class_name,
        u.image,
        c.college_name
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.college_id
      WHERE u.user_id = ?
    `

    const [user] = await sequelize.query(sql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })

    if (!user) {
      return error(res, '用户不存在', 404)
    }

    // 检查用户信息完善度
    const missingFields = []
    if (!user.student_id) missingFields.push('学号')
    if (!user.real_name) missingFields.push('真实姓名')
    if (!user.college_id) missingFields.push('学院')

    // 添加信息完善状态
    user.profileCompleted = missingFields.length === 0
    user.missingFields = missingFields

    success(res, user)
  } catch (err) {
    console.error('获取用户信息错误:', err)
    error(res, '服务器错误', 500)
  }
}




