from flask import Flask, render_template, send_from_directory,jsonify, request, render_template, redirect, url_for, flash, session
import os
import hashlib
from mysql.connector import Error
import mysql.connector
from datetime import datetime
import traceback

mysql_host = os.environ.get('MYSQL_HOST', 'localhost')

def hash_password(password, salt="fixed_salt_value"):
    salted_password = (salt + password).encode('utf-8')  
    hashed_password = hashlib.sha256(salted_password).hexdigest()
    return hashed_password


class draw:
    def __init__(self):
        self.dbConfig= {
            'host': mysql_host, 
            'user': 'service_user', 
            'password': 'service_password', 
            'database': 'user_drawing_db', 
            'port': 3306, 
            'charset': 'utf8mb4'
        }
        

    def login(self,acount:str, Pwd:str,ip_address: str):
        # 初始化连接结果为 None
        result = None
        
        try:
            # 创建数据库连接
            connection = mysql.connector.connect(**self.dbConfig)
            
            if connection.is_connected():
                # 创建一个游标对象来执行查询
                cursor = connection.cursor()
                
                # 查询用户凭据
                queryAccess = "SELECT user_type, password FROM users WHERE username = %s"
                cursor.execute(queryAccess, (acount,))
                result = cursor.fetchone()

                if result:
                    # 用户存在，验证密码
                    db_password = result[1]  # 从数据库获取存储的密码
                    hashed_db_pwd=hash_password(Pwd)

                    if db_password == hashed_db_pwd:
                        # 密码匹配，返回用户类型
                        return result[0]
                    else:
                        # 密码不匹配，返回 None
                        print("Incorrect password!")
                        return None
                else:
                    # 用户不存在，执行插入新用户操作
                    print("User not found, registering new user...")
                    
                    # 执行插入新用户
                    queryInsert = """
                    INSERT INTO users (username, password, user_type, first_ip)
                    VALUES (%s, %s, %s, %s)
                    """
                    hashed_pwd = hash_password(Pwd)  # 对密码进行哈希
                    user_type = 'client'  # 默认用户类型为 'client'
                    
                    cursor.execute(queryInsert, (acount, hashed_pwd, user_type, ip_address))
                    connection.commit()
                    print("New user registered successfully!")
                    
                    # 返回新用户的类型
                    return user_type

        except Error as e:
            # 捕获异常并打印错误信息
            print(f"数据库连接错误: {e}")
        
        finally:
            if connection:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        
        return result

    def saveImages(self, session: str, data):
        cursor = None  # 初始化 cursor 为 None，防止在 finally 块中引用未定义的变量
        conn = None  # 初始化 conn 为 None

        try:
            # 校验输入数据
            if not data:
                raise ValueError("No data provided")
            canvas_id = data.get('canvasId')
            width = data.get('width')
            height = data.get('height')
            elements = data.get('elements', [])

            if not canvas_id:
                raise ValueError("Invalid canvasId")
            if not isinstance(width, int) or width <= 0:
                raise ValueError("Invalid width")
            if not isinstance(height, int) or height <= 0:
                raise ValueError("Invalid height")
            # 连接到数据库
            conn = mysql.connector.connect(**self.dbConfig)
            cursor = conn.cursor()
            # 检查图像是否已存在
            check_query = """
                SELECT * FROM images WHERE username = %s AND canvas_id = %s
            """
            cursor.execute(check_query, (session['UID'], canvas_id))
            existing_image = cursor.fetchone()
            if existing_image:
                # 图像已存在，执行更新操作
                update_image_query = """
                    UPDATE images
                    SET width = %s, height = %s, latest_edit_time = %s
                    WHERE username = %s AND canvas_id = %s
                """
                latest_edit_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(update_image_query, (width, height, latest_edit_time, session['UID'], canvas_id))
                conn.commit()  # 提交更新操作
                # 删除旧的图像元素
                delete_elements_query = """
                    DELETE FROM image_elements WHERE image_id = (
                        SELECT id FROM images WHERE username = %s AND canvas_id = %s
                    )
                """
                cursor.execute(delete_elements_query, (session['UID'], canvas_id))
                conn.commit()  # 提交删除操作
                # 获取图像 ID
                cursor.execute("SELECT id FROM images WHERE username = %s AND canvas_id = %s", (session['UID'], canvas_id))
                image_id = cursor.fetchone()[0]
            else:
                # 图像不存在，执行插入操作
                latest_edit_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                insert_image_query = """
                    INSERT INTO images (username, canvas_id, width, height, latest_edit_time)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_image_query, (session['UID'], canvas_id, width, height, latest_edit_time))
                conn.commit()  # 提交插入操作
                # 获取插入后的图像 ID
                image_id = cursor.lastrowid
            # 插入新的图像元素到 `image_elements` 表
            if elements:
                insert_element_query = """
                    INSERT INTO image_elements (image_id, file_name, position_x, position_y, rotation)
                    VALUES (%s, %s, %s, %s, %s)
                """
                for element in elements:
                    file_name = element.get('src')
                    position_x = element.get('x')
                    position_y = element.get('y')
                    rotation = element.get('rotation', 0)  # 默认旋转角度为 0
                    cursor.execute(insert_element_query, (image_id, file_name, position_x, position_y, rotation))
                conn.commit()  # 提交事务
                # 成功响应
                return True,jsonify({
                    "status": "success",
                    "message": "Image data saved successfully",
                    "canvasId": canvas_id,
                    "elementsSaved": len(elements)
                }), 200
        except ValueError as ve:
            # 数据验证错误
            print("error",str(ve))
            traceback.print_exc()
            return False,jsonify({"error": str(ve)}), 400
        except mysql.connector.Error as db_err:
            # 数据库错误
            print("Database error",str(db_err))
            traceback.print_exc()

            return False,jsonify({"error": "Database error", "details": str(db_err)}), 500
        except Exception as e:
            # 捕获其他错误
            print("Internal Server Error",str(e))
            traceback.print_exc()

            return False,jsonify({"error": "Internal Server Error", "details": str(e)}), 500
        finally:
            # 确保数据库连接被关闭
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def GetUsersAllImageData(self, session):
        try:
            # 连接到数据库
            conn = mysql.connector.connect(**self.dbConfig)
            cursor = conn.cursor()

            # 查询当前用户所有的图像基本信息
            query_images = """
                SELECT id, width, height, latest_edit_time
                FROM images
                WHERE username = %s
            """
            cursor.execute(query_images, (session['UID'],))
            images = cursor.fetchall()

            if not images:
                return None, "No images found for this user"

            # 构建返回的图像数据
            image_data_list = []

            for image in images:
                id, width, height, latest_edit_time = image

                # 获取当前图像的元素
                query_elements = """
                    SELECT file_name, position_x, position_y, rotation
                    FROM image_elements
                    WHERE image_id = (SELECT id FROM images WHERE canvas_id = %s AND username = %s)
                """
                cursor.execute(query_elements, (id, session['UID']))
                elements = cursor.fetchall()

                # 构造图像及其元素的数据
                image_data = {
                    "canvasId": id,
                    "width": width,
                    "height": height,
                    "latestEditTime": latest_edit_time,
                    "elements": [
                        {
                            "src": element[0],  # 图像文件名
                            "x": element[1],    # X 坐标
                            "y": element[2],    # Y 坐标
                            "rotation": element[3]  # 旋转角度
                        }
                        for element in elements
                    ]
                }

                image_data_list.append(image_data)

            # 返回所有图像数据
            return image_data_list, None

        except mysql.connector.Error as err:
            return None, str(err)

        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()


drawInstanc=draw()

app = Flask(__name__, template_folder='htmls',static_url_path='/static',static_folder='static')
app.secret_key = 'your_secret_key_here'  # 更改为你自己的密钥

# 配置图片文件夹路径
RESOURCES_FOLDER = os.path.join(os.getcwd(), 'resources')

# 静态资源文件夹配置
app.config['UPLOAD_FOLDER'] = RESOURCES_FOLDER

users = ['admin','client']

@app.route('/', methods=['GET', 'POST'])
def login():
    session.clear()  # 清除所有会话数据
    try:
        if request.method == 'POST':
            # 获取表单中的用户名和密码
            UID = request.form['username']
            password = request.form['password']
            ip_address = request.remote_addr

            # 用户登录验证
            result = drawInstanc.login(UID, password,ip_address)

            if result is None:
                print('wrong pwd')
                # 验证失败，显示错误信息
                flash('Invalid username or password.', 'error')
                return render_template('login.html')

            # 验证成功，将用户名存储在会话中
            session['UID'] = UID
            session['role'] = result

            # 打印 UID 和角色信息
            print(session)

            if session['role'] == users[0]:
                return redirect(url_for('adminUser'))
            elif session['role'] == users[1]:
                return redirect(url_for('clientUser')) 
            
        return render_template('login.html')
    except Exception as e:
        # 捕获并记录错误
        print(f"Error in login route: {e}")
        flash('An error occurred. Please try again later.', 'error')
        return render_template('login.html')


@app.route('/admin')
def adminUser():
    return render_template('admin.html')


@app.route('/client')
def clientUser():
    images_dir = os.path.join(app.root_path, 'static', 'images')
    # 获取所有子文件夹作为分类
    categories = {}
    for category in os.listdir(images_dir):
        category_path = os.path.join(images_dir, category)
        if os.path.isdir(category_path):
            # 获取每个子文件夹中的图片文件
            images = [img for img in os.listdir(category_path) if img.endswith(('png', 'jpg', 'jpeg','ico'))]
            categories[category] = images

    return render_template('draw.html', category_images=categories)

# 路由：提供图片文件
@app.route('/images')
def serve_image(filename):
    safe_filename = os.path.basename(filename)
    return send_from_directory(RESOURCES_FOLDER, safe_filename)

@app.route('/save-image', methods=['POST'])
def save_image():
        # 获取请求体中的 JSON 数据
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    res=drawInstanc.saveImages(session,data=data)

    if(res[0]):
        return res[1], res[2]
    else:
        return res[1],res[2]



@app.route('/get-images', methods=['GET'])
def GetUsersAllImageData():
    print(1)
    try:
        # 获取用户所有图像数据（此函数会返回用户的所有图像和元素数据）
        image_data, error = drawInstanc.GetUsersAllImageData(session)
        if error:
            return jsonify({"error": error}), 500
        print(image_data)
        return jsonify(image_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # 设置为 0.0.0.0 来监听所有可用的 IPv4 地址，端口指定为 9986
    app.run(host='0.0.0.0',port=80, debug=True)
