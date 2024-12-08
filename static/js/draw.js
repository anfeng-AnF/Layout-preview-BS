const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const drawableElements = [];
let isDragging = false;
let currentElementIndex = -1;
let currentImage=null;
let images=[]

let startX,
    startY,
    offsetX,
    offsetY,
    startAngle,
    scaleFactor = 1;

let startDist = 0,
    startAngleForRotation = 0;

let selectedElement = null;

const optionStatus = Object.freeze({
    MOVE: 'move',
    ROTATE: 'rotate',
    DELETE: 'deleteSelected',
    CLEAR: 'Clear'
});

let currentStatus = optionStatus.MOVE;

window.onload = function() {
    console.log("页面加载完成");

    // 从本地存储加载画布数据
    loadCanvasData();
    canvas.width = 1280;
    canvas.height = 720;

    // 重新绘制 Canvas 内容（可以根据需求添加绘制逻辑）
    drawImages();
    // 执行其他初始化操作，例如：初始化画布、绑定事件等
    initializeCanvas();
};

function loadCanvasData() {
    const savedData = JSON.parse(localStorage.getItem('canvasData') || '[]');
    if (savedData.length > 0) {
        savedData.forEach(data => {
            const element = new ImageElement(data.src, data.x, data.y, data.width, data.height, data.rotation);
            myImage.addElement(element);  // 假设myImage是已经创建的Image实例
        });
    }
}

function initializeCanvas() {
    // 执行画布初始化操作，比如创建Canvas实例，初始化默认大小等
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    // 执行其他需要的初始化任务
}


window.onbeforeunload = function(e) {
    // 提示用户确认离开页面
    const confirmationMessage = "您有未保存的内容，确定要离开吗？";
    (e || window.event).returnValue = confirmationMessage; // 适用于不同浏览器
    return confirmationMessage; // 适用于某些浏览器

    // 保存画布数据到本地存储或服务器
    saveImage();
};

// class Image {
//     constructor(canvasId, width, height) {
//         // 初始化画布的属性
//         this.canvasId = canvasId; // 唯一标识这个 canvas
//         this.width = width;
//         this.height = height;
//         this.elements = [];  // 存储图像元素（比如图片、图标、图形等）
//         // this.canvas = document.getElementById(canvasId);  // 获取 canvas 元素
//         // this.ctx = this.canvas.getContext('2d'); // 获取 canvas 的 2d 绘图上下文

//         // 设置画布大小
//         this.canvas.width = this.width;
//         this.canvas.height = this.height;
//     }

//     // 添加元素到画布
//     addElement(element) {
//         this.elements.push(element);  // 将新的图像元素加入到元素列表中
//         this.draw();  // 更新绘制
//     }

//     // 绘制画布中的所有元素
//     draw() {
//         this.ctx.clearRect(0, 0, this.width, this.height); // 清空画布

//         // 遍历所有元素并绘制
//         this.elements.forEach((element) => {
//             element.draw(this.ctx);  // 绘制每个元素
//         });
//     }

//     // 删除指定元素
//     removeElement(element) {
//         const index = this.elements.indexOf(element);
//         if (index !== -1) {
//             this.elements.splice(index, 1);  // 移除该元素
//             this.draw();  // 更新绘制
//         }
//     }

//     // 获取所有元素
//     getElements() {
//         return this.elements;
//     }
// }


// 定义图像元素
class ImageElement {
    constructor(src, x, y, width, height, angle = 0) {
        this.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle; // 旋转角度
        this.image = new Image();
        this.image.src = src;

        this.image.onload = () => {
            this.draw();
        }

            ;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    isPointInside(x, y) {
        const dx = x - (this.x + this.width / 2);
        const dy = y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.width / 2;
    }
}

function setMode(mode) {
    switch (mode) {
        case optionStatus.MOVE:
        case optionStatus.ROTATE:
            currentStatus = mode;
            break;
        case optionStatus.DELETE:
            deleteElement();
            break;
        case optionStatus.CLEAR:
            let result = confirm("全部清空？");
            if (result) {
                drawableElements.length = 0;
                selectedElement = null;
                drawImages();
            }
            break;
        default:
            console.log("Unknown mode");
    }
}

function deleteElement() {
    if (selectedElement) {
        drawableElements.splice(drawableElements.indexOf(selectedElement), 1);
        selectedElement = null;
        drawImages();
    }
}

// 选择图像
function selectImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = function() {
        // 获取图像的实际宽度和高度
        const imageWidth = img.width;
        const imageHeight = img.height;

        // 创建 ImageElement 对象（可以根据实际需要修改参数）
        const image = new ImageElement(src, 100, 100, imageWidth, imageHeight);  // 使用实际的宽高
        drawableElements.push(image);

        // 绘制所有选中的图像
        drawImages();
    };
    img.onerror = function() {
        console.error('图片加载失败:', src);
    };
}

// 绘制所有图像和选中元素的矩形框
function drawImages() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制每个图像
    for (let i = 0; i < drawableElements.length; i++) {
        const img = drawableElements[i];
        img.draw();


        // 如果该图像被选中，绘制矩形框
        if (selectedElement === img) {
            ctx.strokeStyle = '#FF0000'; // 红色矩形框
            ctx.lineWidth = 3;
            ctx.strokeRect(img.x - 5, img.y - 5, img.width + 10, img.height + 10); // 矩形框加5像素的边距
        }
    }
}



canvas.addEventListener('touchstart', (e) => {
    // 获取 canvas 的边界信息
    const rect = canvas.getBoundingClientRect();
    const xfactor = canvas.width / (rect.right - rect.left);
    const yfactor = canvas.height / (rect.bottom - rect.top);


    // 单点触摸，进行拖动
    // 获取触摸点相对于 canvas 的位置
    const touchX = (e.touches[0].clientX - rect.left) * xfactor;
    const touchY = (e.touches[0].clientY - rect.top) * yfactor;

    // 遍历所有已选择的图像
    for (let i = 0; i < drawableElements.length; i++) {
        // 判断触摸点是否在图像内
        if (drawableElements[i].isPointInside(touchX, touchY)) {
            isDragging = true; // 设置为拖动状态
            currentElementIndex = i; // 记录当前正在拖动的图像

            // 记录触摸点相对于图像的偏移量
            startX = e.touches[0].clientX; // 当前触摸点的x位置
            startY = e.touches[0].clientY; // 当前触摸点的y位置
            offsetX = drawableElements[i].x;
            offsetY = drawableElements[i].y;
            selectedElement = drawableElements[i]; // 选中该图像
            drawImages();
            break; // 找到第一个符合条件的图像后就不再继续遍历
        }
    }

});

// 触摸移动事件
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // 防止页面滚动

    const rect = canvas.getBoundingClientRect();
    const xfactor = canvas.width / (rect.right - rect.left);
    const yfactor = canvas.height / (rect.bottom - rect.top);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 当前触摸点的坐标（考虑到缩放因子）
    const touchX = (e.touches[0].clientX - rect.left) * xfactor;
    const touchY = (e.touches[0].clientY - rect.top) * yfactor;
    if (currentStatus == optionStatus.MOVE) {

        // 计算相对于起始位置的偏移量
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        // 更新图像的位置
        drawableElements[currentElementIndex].x = offsetX + dx * xfactor;
        drawableElements[currentElementIndex].y = offsetY + dy * yfactor;

        // 图像的宽度和高度
        const imageWidth = drawableElements[currentElementIndex].width || 100; // 默认 100 像素
        const imageHeight = drawableElements[currentElementIndex].height || 100; // 默认 100 像素

        // 检查图像是否超出 Canvas 边界
        if (drawableElements[currentElementIndex].x < 0) {
            drawableElements[currentElementIndex].x = 0; // 防止超出左边界
        } else if (drawableElements[currentElementIndex].x + imageWidth > canvasWidth) {
            drawableElements[currentElementIndex].x = canvasWidth - imageWidth; // 防止超出右边界
        }

        if (drawableElements[currentElementIndex].y < 0) {
            drawableElements[currentElementIndex].y = 0; // 防止超出上边界
        } else if (drawableElements[currentElementIndex].y + imageHeight > canvasHeight) {
            drawableElements[currentElementIndex].y = canvasHeight - imageHeight; // 防止超出下边界
        }

        // 重新绘制所有图像
        drawImages();
    }
    else if (currentStatus == optionStatus.ROTATE) {

        const imageCenterX = drawableElements[currentElementIndex].x + drawableElements[currentElementIndex].width / 2;
        const imageCenterY = drawableElements[currentElementIndex].y + drawableElements[currentElementIndex].height / 2;

        const beginAngle = { x: startX - imageCenterX, y: startY - imageCenterY };
        const currentAngle = { x: touchX - imageCenterX, y: touchY - imageCenterY };

        drawableElements[currentElementIndex].angle = calculateAngleWithSign(beginAngle, currentAngle) * 180 / Math.PI;
        drawImages();
    }


});

// 鼠标按下事件
canvas.addEventListener('mousedown', (e) => {

    const rect = canvas.getBoundingClientRect();
    const xfactor = canvas.width / (rect.right - rect.left);
    const yfactor = canvas.height / (rect.bottom - rect.top);
    const mouseX = (e.clientX - rect.left) * xfactor;
    const mouseY = (e.clientY - rect.top) * yfactor;
    // 遍历所有已选择的图像
    for (let i = 0; i < drawableElements.length; i++) {

        // 判断鼠标是否在图像内
        if (drawableElements[i].isPointInside(mouseX, mouseY)) {
            isDragging = true; // 设置为拖动状态
            currentElementIndex = i; // 记录当前正在拖动的图像

            // 记录鼠标相对于图像的偏移量
            startX = mouseX;
            startY = mouseY;
            offsetX = drawableElements[i].x;
            offsetY = drawableElements[i].y;
            selectedElement = drawableElements[i]; // 选中该图像

            drawImages();
            break;
        }
    }
    //drawDebugPoint(startX, startY);
});

function calculateAngleWithSign(a, b) {
    // 向量 a 和 b 的分量
    const ax = a.x, ay = a.y;
    const bx = b.x, by = b.y;

    // 计算点积：a·b = ax * bx + ay * by
    const dotProduct = ax * bx + ay * by;

    // 计算向量 a 和 b 的模
    const magnitudeA = Math.sqrt(ax * ax + ay * ay);
    const magnitudeB = Math.sqrt(bx * bx + by * by);

    // 计算夹角的余弦值
    const cosTheta = dotProduct / (magnitudeA * magnitudeB);

    // 使用反余弦函数（arccos）计算夹角（单位：弧度）
    let angle = Math.acos(cosTheta);

    // 计算叉积来判断方向
    const crossProduct = ax * by - ay * bx;

    // 如果叉积为负，说明夹角是顺时针的，我们需要将角度取负
    if (crossProduct < 0) {
        angle = -angle;  // 夹角为负，逆时针为正，顺时针为负
    }
    console.log(angle);
    return angle;  // 返回夹角（弧度）
}

// 鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const xfactor = canvas.width / (rect.right - rect.left);
    const yfactor = canvas.height / (rect.bottom - rect.top);
    const mouseX = (e.clientX - rect.left) * xfactor;
    const mouseY = (e.clientY - rect.top) * yfactor;
    if (currentStatus == optionStatus.MOVE && currentElementIndex !== -1) {
        // 计算相对于起始位置的偏移量
        const dx = mouseX - startX; // 当前鼠标与起始位置的x轴偏移量
        const dy = mouseY - startY; // 当前鼠标与起始位置的y轴偏移量

        const imageWidth = drawableElements[currentElementIndex].width || 100; // 图像宽度，默认100
        const imageHeight = drawableElements[currentElementIndex].height || 100; // 图像高度，默认100

        // 获取 Canvas 的尺寸
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // 更新图像的位置
        drawableElements[currentElementIndex].x = offsetX + dx;
        drawableElements[currentElementIndex].y = offsetY + dy;

        // 检查图像是否超出 Canvas 边界
        if (drawableElements[currentElementIndex].x < 0) {
            drawableElements[currentElementIndex].x = 0; // 如果超出左边界，将 x 设置为 0
        } else if (drawableElements[currentElementIndex].x + imageWidth > canvasWidth) {
            drawableElements[currentElementIndex].x = canvasWidth - imageWidth; // 如果超出右边界，将 x 设置为最大有效值
        }

        if (drawableElements[currentElementIndex].y < 0) {
            drawableElements[currentElementIndex].y = 0; // 如果超出上边界，将 y 设置为 0
        } else if (drawableElements[currentElementIndex].y + imageHeight > canvasHeight) {
            drawableElements[currentElementIndex].y = canvasHeight - imageHeight; // 如果超出下边界，将 y 设置为最大有效值
        }
        // 重新绘制所有图像
        drawImages();
    }
    else if (currentStatus == optionStatus.ROTATE && currentElementIndex !== -1) {
        const imageCenterX = drawableElements[currentElementIndex].x + drawableElements[currentElementIndex].width / 2;
        const imageCenterY = drawableElements[currentElementIndex].y + drawableElements[currentElementIndex].height / 2;

        const beginAngle = { x: startX - imageCenterX, y: startY - imageCenterY };
        const currentAngle = { x: mouseX - imageCenterX, y: mouseY - imageCenterY };

        drawableElements[currentElementIndex].angle = calculateAngleWithSign(beginAngle, currentAngle) * 180 / Math.PI;
        drawImages();
    }
});

// 鼠标释放事件
canvas.addEventListener('mouseup', (e) => {
    isDragging = false; // 停止拖动
    currentElementIndex = -1; // 重置当前图像索引
});

// 鼠标离开事件，防止鼠标离开 canvas 时继续拖动
canvas.addEventListener('mouseleave', (e) => {
    isDragging = false; // 停止拖动
    currentElementIndex = -1; // 重置当前图像索引
});

// 触摸结束事件
canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isDragging = false; // 停止拖动
        currentElementIndex = -1; // 重置当前图像索引
    }

    else if (e.touches.length === 1) {
        // 双点触摸已结束，转为单点触摸
        startDist = 0;
        startAngle = 0;
    }
});

function downloadImage() {
    temp=selectedElement;
    selectedElement=null;
    drawImages();
    // 获取 Canvas 的数据URL
    const dataURL = canvas.toDataURL("image/png");
    
    // 创建一个临时的下载链接
    const link = document.createElement('a');
    link.href = dataURL;  // 数据URL作为链接的 href
    link.download = 'canvas_image.png';  // 设置下载的文件名
    
    // 触发下载
    link.click();
    selectedElement=temp;
    drawImages();
}

function saveImage() {
    // 获取画布元素
    const canvas = document.getElementById('myCanvas');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 获取画布中所有图形元素的信息
    const elementsData = drawableElements.map(image => {
        return {
            x: image.x,
            y: image.y,
            width: image.width,
            height: image.height,
            angle: image.angle, // 如果你有旋转信息
            src: image.src  // 图片路径
        };
    });

    // 组合要发送的数据
    const data = {
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        elements: elementsData
    };

    // 发送 AJAX 请求到后端保存数据
    fetch('/save-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data) // 将数据转换为 JSON 字符串
    })
    .then(response => response.json())
    .then(data => {
        console.log('保存成功:', data);
    })
    .catch((error) => {
        console.error('保存失败:', error);
    });
}


canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isDragging = false;
        currentElementIndex = -1;
    }
});

function drawDebugPoint(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red'; // Debug 点的颜色
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI); // 绘制半径为 5 的圆形点
    ctx.fill();
}

const resolutions = {
    "3840x2160": { width: 3840, height: 2160 },
    "2560x1440": { width: 2560, height: 1440 },
    "1920x1080": { width: 1920, height: 1080 },
    "1280x720": { width: 1280, height: 720 },
    "1366x768": { width: 1366, height: 768 },
    "1024x768": { width: 1024, height: 768 },
    "800x600": { width: 800, height: 600 },
    "640x480": { width: 640, height: 480 },
};

function setCanvasResolution() {
    // 获取选中的分辨率
    const selectedResolution = document.getElementById('resolution').value;

    // 根据选择的分辨率更新 Canvas 大小
    const resolution = resolutions[selectedResolution];
    canvas.width = resolution.width;
    canvas.height = resolution.height;

    // 重新绘制 Canvas 内容（可以根据需求添加绘制逻辑）
    drawImages();
}