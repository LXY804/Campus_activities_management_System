-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  config_id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT,
  description VARCHAR(200),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- 插入默认配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_activity_people', '500', '最大活动人数限制'),
('review_timeout', '48', '审核活动超时时间（小时）'),
('email_notification', 'true', '启用邮件通知'),
('maintenance_mode', 'false', '维护模式')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);


