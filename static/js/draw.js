
DM = new DrawManager();

window.onload = function () {
    return;
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


window.onbeforeunload = function (e) {
    // 提示用户确认离开页面
    const confirmationMessage = "您有未保存的内容，确定要离开吗？";
    (e || window.event).returnValue = confirmationMessage; // 适用于不同浏览器
    return confirmationMessage; // 适用于某些浏览器

    // 保存画布数据到本地存储或服务器
    saveImage();
};

function setMode(mode) {
    DM.setMode(mode);
}

function deleteElement() {
    DM.deleteElement();
}

// 选择图像
function selectImage(src) {
    DM.addElement(src);
}


function downloadImage() {
    DM.downloadImage();
}

function createImage(){
    DM.addImage();
}

function saveImage() {
    let res = DM.saveImage();
    if(res=="nothing changed"){
        alert("貌似没什么需要保存的\n(保存成功)");
    }
    else if(res=="successed"){
        alert("保存成功");
    }
}


function drawDebugPoint(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red'; // Debug 点的颜色
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI); // 绘制半径为 5 的圆形点
    ctx.fill();
}

function setCanvasResolution() {
    DM.setCanvasResolution();
}

