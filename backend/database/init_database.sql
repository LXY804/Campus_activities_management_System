-- 校园活动管理系统数据库初始化脚本

CREATE DATABASE IF NOT EXISTS activity_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE activity_management;

-- 1. 学院表 (colleges)
CREATE TABLE colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT,
    college_name VARCHAR(100) NOT NULL,
    college_code VARCHAR(20) NOT NULL UNIQUE
);

-- 2. 用户表 (users)
CREATE TABLE `users`  (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','organizer','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'student',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `college_id` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `student_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '学号',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '姓名',
  `gender` enum('男','女','其他') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '性别',
  `id_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '证件类型',
  `id_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '证件号',
  `class_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '班级',
  `image` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `college_id`(`college_id` ASC) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;


-- 3. 活动类型表 (activity_types)
CREATE TABLE activity_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL,
    description VARCHAR(200)
);

-- 4. 活动表 (activities)
CREATE TABLE activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(100) NOT NULL,
    activity_code VARCHAR(50) NOT NULL UNIQUE,
    Activity_description TEXT,
    type_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    target_college_id INT,
    capacity INT NOT NULL,
    organizer_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES activity_types(type_id),
    FOREIGN KEY (target_college_id) REFERENCES colleges(college_id),
    FOREIGN KEY (organizer_id) REFERENCES users(user_id)
);

-- 5. 组织者创建活动表 (organizer_activity_creation)
CREATE TABLE organizer_activity_creation (
    creation_id INT PRIMARY KEY AUTO_INCREMENT,
    organizer_id INT NOT NULL,
    activity_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_check TINYINT DEFAULT 0,
    check_remark VARCHAR(200),
    FOREIGN KEY (organizer_id) REFERENCES users(user_id),
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
);

-- 6. 用户报名表 (user_activity_apply)
CREATE TABLE user_activity_apply (
    apply_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    apply_status TINYINT DEFAULT 0, -- 0:待审核, 1:通过, 2:拒绝, 3:取消
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
);

-- 7. 用户评论表 (activity_comments)
CREATE TABLE activity_comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ========= 视图定义 =========

DROP VIEW IF EXISTS v_activity_overview;
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

DROP VIEW IF EXISTS v_user_registrations;
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

DROP VIEW IF EXISTS v_activity_comments;
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

-- 插入初始数据

-- 插入学院数据（包含 college_code）
INSERT INTO colleges (college_name, college_code) VALUES 
('计算机科学与技术学院', 'CS'),
('机械工程学院', 'ME'),
('电气工程学院', 'EE'),
('商学院', 'BUS'),
('外国语学院', 'FL'),
('法学院', 'LAW');

-- 插入活动类型数据
INSERT INTO activity_types (type_name, description) VALUES 
('学术讲座', '专家讲座、学术报告等活动'),
('科技竞赛', '编程比赛、创新大赛等竞赛活动'),
('文艺演出', '音乐会、话剧、舞蹈等演出活动'),
('体育比赛', '各类体育竞赛活动'),
('志愿服务', '社会公益、志愿服务等活动'),
('社团活动', '社团内部建设、培训等活动');

-- 插入示例用户（修正字段名称：role 而不是 identity）
INSERT INTO users (username, password, role, email, college_id) VALUES 
('admin', 'admin123', 'admin', 'admin@university.edu', 1),
('org1', 'org123', 'organizer', 'org1@university.edu', 1),
('user1', 'user123', 'student', 'user1@university.edu', 2),
('user2', 'user123', 'student', 'user2@university.edu', 3);

-- 插入示例活动
INSERT INTO activities (activity_name, activity_code, Activity_description, type_id, start_time, end_time, location, target_college_id, capacity, organizer_id) VALUES 
('AI技术讲座', 'ACT001', '邀请知名专家讲解人工智能最新技术发展', 1, '2024-12-15 14:00:00', '2024-12-15 16:00:00', '大礼堂', 1, 200, 2),
('编程大赛', 'ACT002', '面向全校学生的编程竞赛活动', 2, '2024-12-20 09:00:00', '2024-12-20 17:00:00', '计算机楼', NULL, 100, 2),
('新年音乐会', 'ACT003', '迎接新年的音乐演出活动', 3, '2024-12-31 19:00:00', '2024-12-31 21:00:00', '音乐厅', NULL, 500, 2);

-- 插入示例报名记录
INSERT INTO user_activity_apply (user_id, activity_id, apply_status) VALUES 
(3, 1, 1), -- user1 已通过 AI技术讲座
(4, 1, 0), -- user2 待审核 AI技术讲座
(3, 2, 1), -- user1 已通过编程大赛
(4, 3, 1); -- user2 已通过新年音乐会

-- 插入示例评论
INSERT INTO activity_comments (activity_id, user_id, content, rating) VALUES 
(1, 3, '讲座内容非常精彩，受益匪浅！', 5),
(2, 3, '比赛组织得很好，题目有挑战性。', 4);