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

// 管理员：获取用户列表
exports.getUserList = async (req, res) => {
  try {
    const { role, search, page = 1, pageSize = 20 } = req.query
    
    let whereClause = 'WHERE 1=1'
    const replacements = []
    
    // 角色过滤
    if (role && role !== '全部') {
      const roleMap = {
        '学生用户': 'student',
        '组织者': 'organizer',
        '管理员': 'admin'
      }
      const dbRole = roleMap[role]
      if (dbRole) {
        whereClause += ' AND u.role = ?'
        replacements.push(dbRole)
      }
    }
    
    // 搜索过滤（用户名）
    if (search) {
      whereClause += ' AND u.username LIKE ?'
      replacements.push(`%${search}%`)
    }
    
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)
    
    const sql = `
      SELECT 
        u.user_id AS id,
        u.username AS name,
        CASE u.role
          WHEN 'student' THEN '学生用户'
          WHEN 'organizer' THEN '组织者'
          WHEN 'admin' THEN '管理员'
          ELSE u.role
        END AS role,
        DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joinDate,
        u.email,
        u.phone,
        c.college_name AS college
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.college_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const countSql = `
      SELECT COUNT(*) AS total
      FROM users u
      ${whereClause}
    `
    
    const [countResult] = await sequelize.query(countSql, {
      replacements,
      type: QueryTypes.SELECT
    })
    
    const list = await sequelize.query(sql, {
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
    console.error('获取用户列表错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员：获取用户统计
exports.getUserStats = async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) AS organizers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
      FROM users
    `
    
    const [stats] = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    })
    
    success(res, {
      total: stats.total || 0,
      students: stats.students || 0,
      organizers: stats.organizers || 0,
      admins: stats.admins || 0
    })
  } catch (err) {
    console.error('获取用户统计错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员：获取本月新增用户数
exports.getNewUsersThisMonth = async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) AS newUsersThisMonth,
        (
          SELECT COUNT(*)
          FROM users
          WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')
        ) AS newUsersLastMonth
      FROM users
      WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
    `
    
    const [result] = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    })
    
    const newUsersThisMonth = result.newUsersThisMonth || 0
    const newUsersLastMonth = result.newUsersLastMonth || 0
    const growthRate = newUsersLastMonth > 0 
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : 0
    
    success(res, {
      newUsersThisMonth,
      newUsersLastMonth,
      growthRate
    })
  } catch (err) {
    console.error('获取本月新增用户错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员：获取系统配置
exports.getSystemConfig = async (req, res) => {
  try {
    // 先检查表是否存在，如果不存在则使用默认值
    const checkTableSql = `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'system_config'
    `
    const [tableCheck] = await sequelize.query(checkTableSql, {
      type: QueryTypes.SELECT
    })
    
    if (tableCheck.count === 0) {
      // 表不存在，返回默认配置
      return success(res, {
        maxActivityPeople: 500,
        reviewTimeout: 48,
        emailNotification: true,
        maintenanceMode: false
      })
    }
    
    const sql = `
      SELECT config_key, config_value
      FROM system_config
      WHERE config_key IN ('max_activity_people', 'review_timeout', 'email_notification', 'maintenance_mode')
    `
    
    const configs = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    })
    
    // 转换为前端需要的格式
    const configMap = {}
    configs.forEach(item => {
      const key = item.config_key
      let value = item.config_value
      
      // 转换数据类型
      if (key === 'max_activity_people') {
        configMap.maxActivityPeople = parseInt(value) || 500
      } else if (key === 'review_timeout') {
        configMap.reviewTimeout = parseInt(value) || 48
      } else if (key === 'email_notification') {
        configMap.emailNotification = value === 'true' || value === '1'
      } else if (key === 'maintenance_mode') {
        configMap.maintenanceMode = value === 'true' || value === '1'
      }
    })
    
    // 设置默认值
    success(res, {
      maxActivityPeople: configMap.maxActivityPeople || 500,
      reviewTimeout: configMap.reviewTimeout || 48,
      emailNotification: configMap.emailNotification !== undefined ? configMap.emailNotification : true,
      maintenanceMode: configMap.maintenanceMode || false
    })
  } catch (err) {
    console.error('获取系统配置错误:', err)
    // 出错时返回默认值
    success(res, {
      maxActivityPeople: 500,
      reviewTimeout: 48,
      emailNotification: true,
      maintenanceMode: false
    })
  }
}

// 管理员：保存系统配置
exports.saveSystemConfig = async (req, res) => {
  try {
    const { maxActivityPeople, reviewTimeout, emailNotification, maintenanceMode } = req.body
    const userId = req.user.id
    
    // 先检查表是否存在，如果不存在则创建
    const checkTableSql = `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'system_config'
    `
    const [tableCheck] = await sequelize.query(checkTableSql, {
      type: QueryTypes.SELECT
    })
    
    if (tableCheck.count === 0) {
      // 创建表
      const createTableSql = `
        CREATE TABLE system_config (
          config_id INT PRIMARY KEY AUTO_INCREMENT,
          config_key VARCHAR(50) NOT NULL UNIQUE,
          config_value TEXT,
          description VARCHAR(200),
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          updated_by INT,
          FOREIGN KEY (updated_by) REFERENCES users(user_id)
        )
      `
      await sequelize.query(createTableSql)
    }
    
    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 来更新或插入
    const configs = [
      { key: 'max_activity_people', value: String(maxActivityPeople || 500) },
      { key: 'review_timeout', value: String(reviewTimeout || 48) },
      { key: 'email_notification', value: emailNotification ? 'true' : 'false' },
      { key: 'maintenance_mode', value: maintenanceMode ? 'true' : 'false' }
    ]
    
    for (const config of configs) {
      const sql = `
        INSERT INTO system_config (config_key, config_value, updated_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          config_value = VALUES(config_value),
          updated_by = VALUES(updated_by),
          updated_at = NOW()
      `
      await sequelize.query(sql, {
        replacements: [config.key, config.value, userId],
        type: QueryTypes.INSERT
      })
    }
    
    success(res, null, '系统配置已保存')
  } catch (err) {
    console.error('保存系统配置错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 管理员：获取数据统计（按月份）
exports.getActivityStats = async (req, res) => {
  try {
    const { month } = req.query // 格式：YYYY-MM
    
    let activitiesWhereClause = ''
    let participationWhereClause = ''
    let ratingWhereClause = ''
    const replacements = []
    
    if (month) {
      activitiesWhereClause = 'WHERE DATE_FORMAT(a.created_at, "%Y-%m") = ?'
      participationWhereClause = 'AND DATE_FORMAT(a.created_at, "%Y-%m") = ?'
      ratingWhereClause = 'WHERE DATE_FORMAT(a.created_at, "%Y-%m") = ?'
      replacements.push(month)
    }
    
    // 获取活动统计
    const activitiesSql = `
      SELECT COUNT(*) AS activities
      FROM activities a
      ${activitiesWhereClause}
    `
    
    const [activitiesResult] = await sequelize.query(activitiesSql, {
      replacements: month ? [month] : [],
      type: QueryTypes.SELECT
    })
    
    // 获取参与度（已报名人数 / 总用户数）
    const participationSql = `
      SELECT 
        COUNT(DISTINCT ua.user_id) AS participants,
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents
      FROM user_activity_apply ua
      INNER JOIN activities a ON ua.activity_id = a.activity_id
      WHERE ua.apply_status IN (0, 1)
      ${participationWhereClause}
    `
    
    const [participationResult] = await sequelize.query(participationSql, {
      replacements: month ? [month] : [],
      type: QueryTypes.SELECT
    })
    
    const totalStudents = participationResult?.totalStudents || 1
    const participants = participationResult?.participants || 0
    const participation = totalStudents > 0 
      ? Math.round((participants / totalStudents) * 100)
      : 0
    
    // 获取平均评分
    const ratingSql = `
      SELECT AVG(ac.rating) AS avgRating
      FROM activity_comments ac
      INNER JOIN activities a ON ac.activity_id = a.activity_id
      ${ratingWhereClause}
    `
    
    const [ratingResult] = await sequelize.query(ratingSql, {
      replacements: month ? [month] : [],
      type: QueryTypes.SELECT
    })
    
    const avgRating = ratingResult?.avgRating 
      ? parseFloat(ratingResult.avgRating).toFixed(1)
      : '0.0'
    
    success(res, {
      activities: activitiesResult?.activities || 0,
      participation,
      rating: avgRating
    })
  } catch (err) {
    console.error('获取活动统计错误:', err)
    error(res, '服务器错误', 500)
  }
}

// 用户：获取个人统计数据
exports.getPersonalStats = async (req, res) => {
  try {
    const userId = req.user.id
    
    // 参与活动数（已通过或待审核的报名）
    const participationSql = `
      SELECT COUNT(*) AS participationCount
      FROM user_activity_apply
      WHERE user_id = ? AND apply_status IN (0, 1)
    `
    
    const [participationResult] = await sequelize.query(participationSql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })
    
    // 已评价数（已提交的评论）
    const commentedSql = `
      SELECT COUNT(DISTINCT activity_id) AS commentedCount
      FROM activity_comments
      WHERE user_id = ?
    `
    
    const [commentedResult] = await sequelize.query(commentedSql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })
    
    // 待评价数（已结束且已通过但未评论的活动）
    const toEvaluateSql = `
      SELECT COUNT(DISTINCT ua.activity_id) AS toEvaluateCount
      FROM user_activity_apply ua
      INNER JOIN activities a ON ua.activity_id = a.activity_id
      LEFT JOIN activity_comments ac ON ac.activity_id = ua.activity_id AND ac.user_id = ua.user_id
      WHERE ua.user_id = ?
        AND ua.apply_status = 1
        AND a.end_time < NOW()
        AND ac.comment_id IS NULL
    `
    
    const [toEvaluateResult] = await sequelize.query(toEvaluateSql, {
      replacements: [userId],
      type: QueryTypes.SELECT
    })
    
    success(res, {
      participationCount: participationResult?.participationCount || 0,
      commentedCount: commentedResult?.commentedCount || 0,
      toEvaluateCount: toEvaluateResult?.toEvaluateCount || 0
    })
  } catch (err) {
    console.error('获取个人统计错误:', err)
    error(res, '服务器错误', 500)
  }
}




