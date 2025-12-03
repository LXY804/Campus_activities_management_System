const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize')
const { success, error } = require('../utils/response')
const path = require('path')

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const sql = `
      SELECT 
        u.user_id AS id,
        u.username,
        u.email,
        u.phone,
        u.role,
        u.college_id,
        c.college_name,
        -- 下面这些字段需要你已经在 users 表中通过 ALTER TABLE 添加
        u.student_id,
        u.real_name,
        u.gender,
        u.id_type,
        u.id_number,
        u.class_name,
        u.image
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.college_id
      WHERE u.user_id = ?
    `

    const [profile] = await sequelize.query(sql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })

    success(res, profile || {})
  } catch (err) {
    console.error('获取个人资料失败:', err)
    error(res, '服务器错误', 500)
  }
}

// 上传头像（使用 users 表中的 image 字段）
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id

    if (!req.file) {
      return error(res, '未收到上传文件', 400)
    }

    // 这里假设静态资源挂在 /uploads，文件保存在 backend/uploads 目录
    const relativePath = path.posix.join('/uploads', req.file.filename)

    await sequelize.query(
      'UPDATE users SET image = ? WHERE user_id = ?',
      {
        replacements: [relativePath, userId],
        type: QueryTypes.UPDATE
      }
    )

    success(res, { image: relativePath }, '头像上传成功')
  } catch (err) {
    console.error('上传头像失败:', err)
    error(res, '服务器错误', 500)
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      phone,
      email,
      collegeId,
      role,
      studentId,
      realName,
      gender,
      idType,
      idNumber,
      className
    } = req.body

    const fields = []
    const replacements = []

    if (typeof studentId !== 'undefined') {
      fields.push('student_id = ?')
      replacements.push(studentId || null)
    }
    if (typeof realName !== 'undefined') {
      fields.push('real_name = ?')
      replacements.push(realName || null)
    }
    if (typeof gender !== 'undefined') {
      fields.push('gender = ?')
      replacements.push(gender || null)
    }
    if (typeof idType !== 'undefined') {
      fields.push('id_type = ?')
      replacements.push(idType || null)
    }
    if (typeof idNumber !== 'undefined') {
      fields.push('id_number = ?')
      replacements.push(idNumber || null)
    }
    if (typeof className !== 'undefined') {
      fields.push('class_name = ?')
      replacements.push(className || null)
    }

    if (typeof phone !== 'undefined') {
      fields.push('phone = ?')
      replacements.push(phone || null)
    }
    if (typeof email !== 'undefined') {
      fields.push('email = ?')
      replacements.push(email || null)
    }
    if (typeof collegeId !== 'undefined') {
      fields.push('college_id = ?')
      replacements.push(collegeId || null)
    }

    if (role && req.user.role === 'admin') {
      fields.push('role = ?')
      replacements.push(role)
    }

    if (!fields.length) {
      return success(res, null, '无需更新')
    }

    replacements.push(userId)

    await sequelize.query(
      `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE user_id = ?
      `,
      {
        replacements,
        type: QueryTypes.UPDATE
      }
    )

    success(res, null, '更新成功')
  } catch (err) {
    console.error('更新个人资料失败:', err)
    error(res, '服务器错误', 500)
  }
}




