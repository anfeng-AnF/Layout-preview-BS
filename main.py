from flask import Flask, render_template, send_from_directory,jsonify, request, render_template, redirect, url_for, flash, session
import os
import hashlib
from mysql.connector import Error
import mysql.connector


mysql_host = os.environ.get('MYSQL_HOST', 'localhost')

def hash_password(password, salt="fixed_salt_value"):
    salted_password = (salt + password).encode('utf-8')  
    hashed_password = hashlib.sha256(salted_password).hexdigest()
    return hashed_password


class draw:


    def login(self,acount:str, Pwd:str,ip_address: str):
        # 初始化连接结果为 None
        result = None
        
        try:
            # 创建数据库连接
            connection = mysql.connector.connect(
                host=mysql_host,
                port=3306,
                user="service_user",
                password="service_password",
                database="user_drawing_db"
            )
            
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
    # 获取前端发送的数据
    data = request.get_json()
    canvas_width = data['canvasWidth']
    canvas_height = data['canvasHeight']
    elements_data = data['elements']

    # 假设每个用户只能上传一张图像，获取当前用户信息
    user = User.query.first()  # 这里可以根据当前登录用户获取

    # 创建图像记录
    image = Image(width=canvas_width, height=canvas_height, user_id=user.id)
    db.session.add(image)
    db.session.commit()  # 提交，确保获取到 image.id

    # 保存图像元素
    for element in elements_data:
        image_element = ImageElement(
            image_id=image.id,  # 关联到该图像
            file_name=element['src'],  # 图像文件名
            position_x=element['x'],  # 图像元素的x坐标
            position_y=element['y'],  # 图像元素的y坐标
            rotation=element['angle']  # 图像元素的旋转角度
        )
        db.session.add(image_element)

    db.session.commit()  # 提交图像元素

    return jsonify({'message': '保存成功'})

if __name__ == '__main__':
    # 设置为 0.0.0.0 来监听所有可用的 IPv4 地址，端口指定为 9986
    app.run(host='0.0.0.0',port=80, debug=True)
