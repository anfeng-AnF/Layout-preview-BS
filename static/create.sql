-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS user_drawing_db;

-- 2. 使用刚刚创建的数据库
USE user_drawing_db;

-- 创建用户表 (表1)
CREATE TABLE users (
    username VARCHAR(255) NOT NULL PRIMARY KEY,             -- 用户名
    password VARCHAR(255) NOT NULL,                         -- 密码
    user_type ENUM('admin', 'client') NOT NULL,             -- 用户类型，'admin' 或 'client'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- 创建时间，默认当前时间
    first_ip VARCHAR(45) NOT NULL                           -- 初次创建的IP地址
);

CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,              -- 图像ID，自增
    username VARCHAR(255) NOT NULL,                  -- 用户名，关联用户表
    canvas_id VARCHAR(255) NOT NULL,                 -- Canvas唯一标识符
    width INT NOT NULL,                              -- 图像宽度
    height INT NOT NULL,                             -- 图像高度
    latest_edit_time TIMESTAMP,                      -- 最近一次编辑时间
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE  -- 外键，关联到用户表
);



-- 创建图像元素表 (表3)
CREATE TABLE image_elements (
    id INT AUTO_INCREMENT PRIMARY KEY,               -- 元素ID，自增
    image_id INT NOT NULL,                            -- 图像ID，关联到图像表
    file_name VARCHAR(255) NOT NULL,                  -- 元素文件名
    position_x FLOAT NOT NULL,                          -- 元素位置x坐标
    position_y FLOAT NOT NULL,                          -- 元素位置y坐标
    rotation FLOAT NOT NULL,                          -- 元素旋转角度（单位：度）
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE  -- 外键，关联到图像表
);

CREATE TABLE ip_registration_log (
    id INT AUTO_INCREMENT PRIMARY KEY,                      -- 日志ID，自增
    ip_address VARCHAR(45) NOT NULL,                        -- IP地址
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 注册时间
    FOREIGN KEY (ip_address) REFERENCES users(first_ip)
);

-- u p 13916578626 8dbc6bd9c5a4818d5f20f6e25cccb6a444666ec0665d9b70d1a706c15bc00b2e

CREATE USER IF NOT EXISTS 'service_user'@'localhost' IDENTIFIED BY 'service_password';

GRANT ALL PRIVILEGES ON user_drawing_db.* TO 'service_user'@'localhost';

