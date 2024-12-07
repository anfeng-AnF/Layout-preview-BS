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

-- 创建图像表 (表2)
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- 图像ID，自增
    width INT NOT NULL,                       -- 图像宽度
    height INT NOT NULL,                      -- 图像高度
    user_id INT NOT NULL,                     -- 用户ID，关联用户表
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- 外键，关联到用户表
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 图像创建时间，默认当前时间
);

-- 创建图像元素表 (表3)
CREATE TABLE image_elements (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- 元素ID，自增
    image_id INT NOT NULL,                    -- 图像ID，关联到图像表
    file_name VARCHAR(255) NOT NULL,          -- 元素文件名
    position_x INT NOT NULL,                  -- 元素位置x坐标
    position_y INT NOT NULL,                  -- 元素位置y坐标
    rotation FLOAT NOT NULL,                  -- 元素旋转角度（单位：度）
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE  -- 外键，关联到图像表
);

CREATE USER IF NOT EXISTS 'service_user'@'localhost' IDENTIFIED BY 'service_password';

GRANT ALL PRIVILEGES ON user_drawing_db.* TO 'service_user'@'localhost';

