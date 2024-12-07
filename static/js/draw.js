const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const selectedImages = [];
let isDragging = false;
let currentImageIndex = -1;

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
                selectedImages.length = 0;
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
        selectedImages.splice(selectedImages.indexOf(selectedElement),1);
        selectedElement=null;
        drawImages();
    }
}

// 选择图像
function selectImage(src) {
    const image = new ImageElement(src, 100, 100, 100, 100);
    selectedImages.push(image);
    drawImages();
}

// 绘制所有图像和选中元素的矩形框
function drawImages() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制每个图像
    for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        ctx.drawImage(img.image, img.x, img.y, img.width, img.height);

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
    const xfactor = canvas.width/(rect.right-rect.left);
    const yfactor = canvas.height/(rect.bottom-rect.top);

    if (e.touches.length === 1) {
        // 单点触摸，进行拖动
        // 获取触摸点相对于 canvas 的位置
        const touchX =(e.touches[0].clientX - rect.left)*xfactor;
        const touchY =(e.touches[0].clientY - rect.top)*yfactor;

        // 调试点
        drawDebugPoint(touchX, touchY);

        // 遍历所有已选择的图像
        for (let i = 0; i < selectedImages.length; i++) {
            // 判断触摸点是否在图像内
            if (selectedImages[i].isPointInside(touchX, touchY)) {
                isDragging = true; // 设置为拖动状态
                currentImageIndex = i; // 记录当前正在拖动的图像

                // 记录触摸点相对于图像的偏移量
                startX = e.touches[0].clientX; // 当前触摸点的x位置
                startY = e.touches[0].clientY; // 当前触摸点的y位置
                offsetX = selectedImages[i].x;
                offsetY = selectedImages[i].y;
                selectedElement = selectedImages[i]; // 选中该图像

                break; // 找到第一个符合条件的图像后就不再继续遍历
            }
        }
    }

    else if (e.touches.length === 2) {
        // 双点触摸，进行旋转
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDist = Math.sqrt(dx * dx + dy * dy); // 起始两点之间的距离
        startAngle = Math.atan2(dy, dx) * (180 / Math.PI); // 起始角度

        // 如果图像在双触摸区域内，准备旋转
        for (let i = 0; i < selectedImages.length; i++) {
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;

            if (selectedImages[i].isPointInside(touchX, touchY)) {
                currentImageIndex = i;
                break;
            }
        }
    }
});

// 触摸移动事件
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // 防止页面滚动

    const rect = canvas.getBoundingClientRect();
    const xfactor = canvas.width/(rect.right-rect.left);
    const yfactor = canvas.height/(rect.bottom-rect.top);

    if (isDragging && currentImageIndex !== -1 && e.touches.length === 1) {
        // 当前触摸点的坐标
        const touchX =(e.touches[0].clientX - rect.left)*xfactor;
        const touchY =(e.touches[0].clientY - rect.top)*yfactor;

        // 计算相对于起始位置的偏移量
        const dx = e.touches[0].clientX - startX; // 当前触摸点与起始触摸点的x轴偏移量
        const dy = e.touches[0].clientY - startY; // 当前触摸点与起始触摸点的y轴偏移量

        // 更新图像的位置
        selectedImages[currentImageIndex].x = offsetX + dx*xfactor;
        selectedImages[currentImageIndex].y = offsetY + dy*yfactor;

        // 重新绘制所有图像
        drawImages();
    }

    else if (e.touches.length === 2) {
        // 双点触摸，进行旋转
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy); // 当前两点之间的距离
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI); // 当前角度

        // 计算角度变化
        const angleChange = currentAngle - startAngle;

        // 更新图像的旋转角度
        if (currentImageIndex !== -1) {
            selectedImages[currentImageIndex].angle += angleChange;
        }

        // 更新起始角度和距离
        startDist = currentDist;
        startAngle = currentAngle;

        // 重新绘制所有图像
        drawImages();
    }
});

// 鼠标按下事件
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;

    // 遍历所有已选择的图像
    for (let i = 0; i < selectedImages.length; i++) {

        // 判断鼠标是否在图像内
        if (selectedImages[i].isPointInside(mouseX, mouseY)) {
            isDragging = true; // 设置为拖动状态
            currentImageIndex = i; // 记录当前正在拖动的图像

            // 记录鼠标相对于图像的偏移量
            startX = mouseX;
            startY = mouseY;
            offsetX = selectedImages[i].x;
            offsetY = selectedImages[i].y;
            selectedElement = selectedImages[i]; // 选中该图像
            break;
        }
    }
    drawDebugPoint(startX, startY);
});

// 鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && currentImageIndex !== -1) {
        const mouseX = e.clientX - canvas.offsetLeft;
        const mouseY = e.clientY - canvas.offsetTop;

        // 计算相对于起始位置的偏移量
        const dx = mouseX - startX; // 当前鼠标与起始位置的x轴偏移量
        const dy = mouseY - startY; // 当前鼠标与起始位置的y轴偏移量

        // 更新图像的位置
        selectedImages[currentImageIndex].x = offsetX + dx;
        selectedImages[currentImageIndex].y = offsetY + dy;

        // 重新绘制所有图像
        drawImages();
    }
});

// 鼠标释放事件
canvas.addEventListener('mouseup', (e) => {
    isDragging = false; // 停止拖动
    currentImageIndex = -1; // 重置当前图像索引
});

// 鼠标离开事件，防止鼠标离开 canvas 时继续拖动
canvas.addEventListener('mouseleave', (e) => {
    isDragging = false; // 停止拖动
    currentImageIndex = -1; // 重置当前图像索引
});

// 触摸结束事件
canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isDragging = false; // 停止拖动
        currentImageIndex = -1; // 重置当前图像索引
    }

    else if (e.touches.length === 1) {
        // 双点触摸已结束，转为单点触摸
        startDist = 0;
        startAngle = 0;
    }
});



canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isDragging = false;
        currentImageIndex = -1;
    }
});

function drawDebugPoint(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red'; // Debug 点的颜色
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI); // 绘制半径为 5 的圆形点
    ctx.fill();
}