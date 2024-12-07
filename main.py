from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# 配置图片文件夹路径
RESOURCES_FOLDER = os.path.join(os.getcwd(), 'resources')

# 静态资源文件夹配置
app.config['UPLOAD_FOLDER'] = RESOURCES_FOLDER

# 路由：渲染 HTML 页面
@app.route('/')
def index():
    return render_template('htmls/1.html')

# 路由：提供图片文件
@app.route('/resources/<filename>')
def serve_image(filename):
    return send_from_directory(RESOURCES_FOLDER, filename)

if __name__ == '__main__':
    # 设置为 0.0.0.0 来监听所有可用的 IPv4 地址，端口指定为 9986
    app.run(host='0.0.0.0', port=9986, debug=True)
