
# Layout-preview-BS

这是一个基于 Flask 的网络服务器应用，旨在提供简单的 Web 功能，并与 MySQL 数据库进行交互。运行 `main.py` 即可启动服务器。

## 运行要求

### 必须的配置

在使用本项目之前，确保你已经安装了以下 Python 库：

- Flask
- mysql-connector-python

可以通过运行以下命令来安装这些依赖：

```bash
pip install flask mysql-connector-python
```

### 导入库

`main.py` 文件中必须导入以下库：

```python
from flask import Flask, render_template, send_from_directory, jsonify, request, render_template, redirect, url_for, flash, session
import os
import hashlib
from mysql.connector import Error
import mysql.connector
from datetime import datetime
import traceback
```

### 数据库需求

本项目使用 MySQL 数据库。你需要配置一个 MySQL 数据库并运行以下步骤。

### 默认数据库创建语句

数据库的默认创建脚本 `static/create.sql` 包含数据库的创建语句以及默认的访问密码。你可以在 MySQL 中执行该 SQL 文件以创建必要的数据库结构。


### 数据库连接配置

你需要根据自己的 MySQL 配置编辑数据库连接参数，例如数据库主机、用户名、密码等。连接配置通常在 `main.py` 中设置。

## 启动项目

1. 确保已经安装了所有必要的依赖：

    ```bash
    pip install Flask mysql-connector-python
    ```

2. 确保数据库已正确设置并且 `create.sql` 已运行。

3. 运行 Flask 服务器：

    ```bash
    python main.py
    ```

4. 打开浏览器并访问 `http://127.0.0.1:80` 即可开始使用网络服务器。

## 项目目录结构

```
<project-root>
│
├── static/
│   ├── create.sql    # 默认数据库创建脚本
│   └── ...           # 其他静态资源
│
├── templates/        # Flask 模板文件
│   └── ...           # HTML 文件
│
├── main.py           # 启动 Flask 服务器的主要 Python 文件
├── requirements.txt  # Python 项目的依赖文件
└── README.md         # 本文档
```

## 注意事项

- 请确保你已正确设置 MySQL 数据库，并且能够连接到数据库。
- 如果数据库连接失败，请检查 MySQL 服务是否正常运行，以及数据库访问密码是否正确。
- 对于生产环境，推荐使用更强的数据库密码，并且启用适当的数据库安全配置。
