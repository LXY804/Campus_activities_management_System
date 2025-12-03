const sequelize = require('./config/database')

async function initViews() {
  try {
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    console.log('📝 开始创建数据库视图...')

    // 创建 v_activity_overview 视图
    await sequelize.query('DROP VIEW IF EXISTS v_activity_overview;')
    
    const view1Sql = `
CREATE VIEW v_activity_overview AS
SELECT 
    a.activity_id AS id,
    a.activity_code AS code,
    a.activity_name AS title,
    a.Activity_description AS description,
    a.location,
    a.start_time,
    a.end_time,
    a.capacity,
    a.type_id,
    a.target_college_id,
    a.organizer_id,
    CASE
        WHEN NOW() < a.start_time THEN 'upcoming'
        WHEN NOW() BETWEEN a.start_time AND a.end_time THEN 'open'
        ELSE 'ended'
    END AS status,
    u.username AS organizer_name,
    c.college_name AS target_college_name,
    (
        SELECT COUNT(*)
        FROM user_activity_apply ua
        WHERE ua.activity_id = a.activity_id AND ua.apply_status IN (0, 1)
    ) AS signed_up
FROM activities a
LEFT JOIN users u ON a.organizer_id = u.user_id
LEFT JOIN colleges c ON a.target_college_id = c.college_id
LEFT JOIN organizer_activity_creation oac ON oac.activity_id = a.activity_id
WHERE COALESCE(oac.admin_check, 1) = 1;
`

    await sequelize.query(view1Sql)
    console.log('✅ 创建视图 v_activity_overview 成功')

    // 创建 v_user_registrations 视图
    await sequelize.query('DROP VIEW IF EXISTS v_user_registrations;')
    
    const view2Sql = `
CREATE VIEW v_user_registrations AS
SELECT 
    ua.apply_id AS registration_id,
    ua.user_id,
    ua.activity_id AS event_id,
    ua.apply_status,
    CASE ua.apply_status
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        WHEN 2 THEN 'rejected'
        WHEN 3 THEN 'cancelled'
        ELSE 'pending'
    END AS registration_status,
    ua.applied_at,
    a.activity_code AS event_code,
    a.activity_name AS event_title,
    a.location,
    a.start_time,
    a.end_time,
    a.capacity,
    CASE
        WHEN NOW() < a.start_time THEN 'upcoming'
        WHEN NOW() BETWEEN a.start_time AND a.end_time THEN 'open'
        ELSE 'ended'
    END AS event_status,
    org.username AS organizer_name
FROM user_activity_apply ua
INNER JOIN activities a ON ua.activity_id = a.activity_id
LEFT JOIN users org ON a.organizer_id = org.user_id;
`

    await sequelize.query(view2Sql)
    console.log('✅ 创建视图 v_user_registrations 成功')

    // 创建 v_activity_comments 视图
    await sequelize.query('DROP VIEW IF EXISTS v_activity_comments;')
    
    const view3Sql = `
CREATE VIEW v_activity_comments AS
SELECT
    ac.comment_id,
    ac.activity_id,
    ac.user_id,
    ac.rating,
    ac.content,
    ac.created_at,
    u.username,
    a.activity_name AS event_title,
    a.location,
    a.start_time,
    1 AS status
FROM activity_comments ac
LEFT JOIN users u ON ac.user_id = u.user_id
LEFT JOIN activities a ON ac.activity_id = a.activity_id;
`

    await sequelize.query(view3Sql)
    console.log('✅ 创建视图 v_activity_comments 成功')

    console.log('✅ 所有数据库视图初始化完成')
    await sequelize.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ 初始化失败:', error.message)
    if (error.sql) {
      console.error('SQL:', error.sql)
    }
    await sequelize.close()
    process.exit(1)
  }
}

initViews()

