function calculateAngleWithSign(a, b) {
    const ax = a.x, ay = a.y;
    const bx = b.x, by = b.y;

    const dotProduct = ax * bx + ay * by;

    const magnitudeA = Math.sqrt(ax * ax + ay * ay);
    const magnitudeB = Math.sqrt(bx * bx + by * by);

    const cosTheta = dotProduct / (magnitudeA * magnitudeB);

    let angle = Math.acos(cosTheta);

    const crossProduct = ax * by - ay * bx;

    if (crossProduct < 0) {
        angle = -angle;
    }
    return angle;
}

class ImageElement {
    constructor(src, x, y, width, height, angle = 0) {
        this.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = angle; // 旋转角度
        this.image = new Image();
        this.image.src = src;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
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

const optionStatus = Object.freeze({
    MOVE: 'move',
    ROTATE: 'rotate',
    DELETE: 'deleteSelected',
    CLEAR: 'Clear'
});
const resolutions = {
    "3840x2160": { width: 3840, height: 2160 },
    "2560x1440": { width: 2560, height: 1440 },
    "1920x1080": { width: 1920, height: 1080 },
    "1280x720": { width: 1280, height: 720 },
    "1366x768": { width: 1366, height: 768 },
    "1024x768": { width: 1024, height: 768 },
    "800x600": { width: 800, height: 600 },
    "640x480": { width: 640, height: 480 },
    "1080x1920": { width: 1080, height: 1920 },
};
class MyImage {

    constructor(canvasId, width, height) {
        this.canvasId = canvasId; // Unique identifier for this canvas
        this.width = width;
        this.height = height;
        this.elements = [];  // Store image elements (images, icons, graphics)
        this.selectedElement = null;
        this.canvas = this.setCanvas(canvasId, width, height);  // Get canvas element
        this.ctx = this.canvas.getContext('2d'); // 2D drawing context

        this.currentStatus = optionStatus.MOVE;

        // Initialize event listeners
        this.initializeCanvasEvents();

        //other runtime vars
        this.startx = 0;
        this.starty = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    getJsonifyData() {
        // 创建包含所有图像信息的对象
        const imageData = {
            canvasId: this.canvasId,
            width: this.width,
            height: this.height,
            elements: this.elements.map(element => ({
                src: element.src,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                rotation: element.rotation
            }))
        };

        // 返回JSON格式的对象
        return JSON.stringify(imageData);
    }

    IsEmpty() {
        return this.elements.length == 0;
    }

    setCanvas(id, width, height) {
        // 创建 canvas 元素
        const canvas = document.createElement('canvas');

        // 设置 canvas 的 ID 和尺寸
        canvas.id = id;       // 设置 ID
        canvas.width = width;            // 设置宽度
        canvas.height = height;           // 设置高度
        return canvas;
    }

    getCanvas() {
        if (!this.canvas) {
            this.canvas = this.setCanvas(this.canvasId, this.width, this.height);
        }
        return this.canvas;
    }

    setCanvasResolution() {
        // 获取选中的分辨率
        const selectedResolution = document.getElementById('resolution').value;

        // 根据选择的分辨率更新 Canvas 大小
        const resolution = resolutions[selectedResolution];
        this.canvas.width = resolution.width;
        this.canvas.height = resolution.height;
        this.width = resolution.width;
        this.height = resolution.height;
        // 重新绘制 Canvas 内容（可以根据需求添加绘制逻辑）
        this.draw(this.ctx);;
    }

    DownLoad() {
        let temp = this.selectedElement;
        this.selectedElement = null;
        this.draw(this.ctx);;
        // 获取 Canvas 的数据URL
        const dataURL = this.canvas.toDataURL("image/png");

        // 创建一个临时的下载链接
        const link = document.createElement('a');
        link.href = dataURL;  // 数据URL作为链接的 href
        link.download = 'canvas_image.png';  // 设置下载的文件名

        // 触发下载
        link.click();
        this.selectedElement = temp;
        this.draw(this.ctx);;
    }

    changeMode(mode) {
        switch (mode) {
            case optionStatus.MOVE:
            case optionStatus.ROTATE:
                this.currentStatus = mode;
                break;
            case optionStatus.DELETE:
                this.removeElement(this.selectedElement);
                break;
            case optionStatus.CLEAR:
                let result = confirm("全部清空？");
                if (result) {
                    this.elements.length = 0;
                    this.selectedElement = null;
                    this.draw(this.ctx);;
                }
                break;
            default:
                console.log("Unknown mode");
        }
    }

    addElement(elementSrc, x = 300, y = 300, angle = 0) {
        const img = new Image();
        img.src = elementSrc;
        img.onload = () => {
            // 获取图像的实际宽度和高度
            const imageWidth = img.width;
            const imageHeight = img.height;

            // 创建 ImageElement 对象（可以根据实际需要修改参数）
            const image = new ImageElement(elementSrc, x, y, imageWidth, imageHeight, angle);  // 使用实际的宽高
            this.elements.push(image);  // 访问正确的 `this`，即包含 `elements` 的对象

            // 绘制所有选中的图像
            this.draw(this.ctx);;
        };
        img.onerror = function () {
            console.error('图片加载失败:', elementSrc);
        };
    }

    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }
        this.draw(this.ctx);;
    }

    draw() {
        // Clear canvas before redrawing
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each image element
        for (const element of this.elements) {
            element.draw(this.ctx);

            // Draw a red border around the selected element
            if (this.selectedElement === element) {
                this.ctx.strokeStyle = '#FF0000'; // Red color for the border
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(element.x - 5, element.y - 5, element.width + 10, element.height + 10); // Add a 5px margin to the border
            }
        }
    }

    selectElement(x, y) {
        for (const element of this.elements) {
            if (element.isPointInside(x, y)) {
                this.selectedElement = element;
                this.draw(this.ctx);;
                return;
            }
        }
        this.selectedElement = null;  // Deselect if no element is clicked
    }

    initializeCanvasEvents() {
        // Handle mouse events (mousedown, mousemove, mouseup)
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const xfactor = this.canvas.width / (rect.right - rect.left);
            const yfactor = this.canvas.height / (rect.bottom - rect.top);
            const mouseX = (e.clientX - rect.left) * xfactor;
            const mouseY = (e.clientY - rect.top) * yfactor;

            this.selectElement(mouseX, mouseY);

            if (this.selectedElement) {
                this.startDrag(e, mouseX, mouseY);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.selectedElement) {
                this.dragElement(e, true);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.stopDrag();
        });

        // Handle touch events (touchstart, touchmove, touchend)
        this.canvas.addEventListener('touchstart', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const xfactor = this.canvas.width / (rect.right - rect.left);
            const yfactor = this.canvas.height / (rect.bottom - rect.top);

            const touchX = (e.touches[0].clientX - rect.left) * xfactor;
            const touchY = (e.touches[0].clientY - rect.top) * yfactor;

            this.selectElement(touchX, touchY);

            if (this.selectedElement) {
                this.startDrag(e, touchX, touchY);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.selectedElement) {
                this.dragElement(e, false);
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.stopDrag();
        });
    }

    startDrag(e, x, y) {
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
        this.offsetX = this.selectedElement.x;
        this.offsetY = this.selectedElement.y;
    }

    dragElement(e, bIsPC) {
        if (!this.isDragging) return;

        e.preventDefault(); // 防止页面滚动

        const rect = this.canvas.getBoundingClientRect();
        const xfactor = this.canvas.width / (rect.right - rect.left);
        const yfactor = this.canvas.height / (rect.bottom - rect.top);
        const X = bIsPC ? (e.clientX - rect.left) * xfactor : (e.touches[0].clientX - rect.left) * xfactor;
        const Y = bIsPC ? (e.clientY - rect.top) * yfactor : (e.touches[0].clientY - rect.top) * yfactor;

        // 获取 Canvas 的尺寸
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        if (this.currentStatus == optionStatus.MOVE && this.selectedElement) {
            // 计算相对于起始位置的偏移量
            const dx = X - this.startX; // 当前鼠标与起始位置的x轴偏移量
            const dy = Y - this.startY; // 当前鼠标与起始位置的y轴偏移量

            const imageWidth = this.selectedElement.width || 100; // 图像宽度，默认100
            const imageHeight = this.selectedElement.height || 100; // 图像高度，默认100


            // 更新图像的位置
            this.selectedElement.x = this.offsetX + dx;
            this.selectedElement.y = this.offsetY + dy;

            // 检查图像是否超出 Canvas 边界
            if (this.selectedElement.x < 0) {
                this.selectedElement.x = 0; // 如果超出左边界，将 x 设置为 0
            } else if (this.selectedElement.x + imageWidth > canvasWidth) {
                this.selectedElement.x = canvasWidth - imageWidth; // 如果超出右边界，将 x 设置为最大有效值
            }

            if (this.selectedElement.y < 0) {
                this.selectedElement.y = 0; // 如果超出上边界，将 y 设置为 0
            } else if (this.selectedElement.y + imageHeight > canvasHeight) {
                this.selectedElement.y = canvasHeight - imageHeight; // 如果超出下边界，将 y 设置为最大有效值
            }
            // 重新绘制所有图像
        }
        else if (this.currentStatus == optionStatus.ROTATE && this.selectedElement) {
            const imageCenterX = this.selectedElement.x + this.selectedElement.width / 2;
            const imageCenterY = this.selectedElement.y + this.selectedElement.height / 2;

            const beginAngle = { x: this.startX - imageCenterX, y: this.startY - imageCenterY };
            const currentAngle = { x: X - imageCenterX, y: Y - imageCenterY };

            this.selectedElement.rotation = calculateAngleWithSign(beginAngle, currentAngle) * 180 / Math.PI;
        }
        this.draw(this.ctx);
    }

    stopDrag() {
        this.isDragging = false;
    }

    // Method to save the canvas data to localStorage or server
    saveCanvasData() {
        const elementsData = this.elements.map((element) => ({
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            angle: element.angle,
            src: element.src,
        }));

        const canvasData = {
            width: this.canvas.width,
            height: this.canvas.height,
            elements: elementsData,
        };

        localStorage.setItem('canvasData', JSON.stringify(canvasData));
    }

    // Method to load the saved canvas data from localStorage
    loadCanvasData() {
        const savedData = JSON.parse(localStorage.getItem('canvasData') || '[]');
        savedData.forEach((data) => {
            const element = new ImageElement(data.src, data.x, data.y, data.width, data.height, data.angle);
            this.addElement(element);
        });
    }
}

class DrawManager {
    constructor() {
        this.ImagesArr = [];
        this.maxImages = 50;
        this.editingImage = null;
        this.container = document.getElementById('canvasEditor');
        this.isInitialized=false;
        this.init();
    }

    async init() {

        // 加载从后端传入的 canvas 数据
        await this.fetchImageData();

        // 默认以最近一张 image 作为当前编辑的
        if (this.container) {  // 确保 container 存在
            if (this.container.children.length == 0) {
                // 如果没有子元素，则添加新的 canvas
                this.container.appendChild(this.editingImage.getCanvas());
            } else {
                // 如果已有元素，移除旧的 canvas，并添加新的
                this.container.innerHTML = ''; // 清空容器
                this.container.appendChild(this.editingImage.getCanvas());
            }
        } else {
            console.error('Container element not found!');
        }

        console.log(this.editingImage.getCanvas()); // 输出 canvas 元素
    }

    addImage() {
        // 如果当前编辑的 image 不为空，则保存到数组中
        if (!this.editingImage.IsEmpty() && !this.ImagesArr.includes(this.editingImage)) {
            this.ImagesArr.push(this.editingImage);
            this.saveImage();
        }

        if (this.ImagesArr.length < this.maxImages) {
            // 创建一个新的 MyImage 实例
            this.editingImage = new MyImage(this.ImagesArr.length + 1, 1280, 720);

            // 清空 container，并追加新的 canvas
            this.container.innerHTML = ''; // 清空容器内容
            this.container.appendChild(this.editingImage.getCanvas());
        } else {
            alert('图像数量超过上限(50)', this.maxImages);
        }
    }

    addElement(src) {
        if (this.editingImage) {
            this.editingImage.addElement(src);
        }
    }

    deleteImage(idx) {
        this.ImagesArr.splice(idx, 1);
    }

    deleteElement() {
        if (this.editingImage) {
            this.editingImage.removeElement();
        }
    }

    ChangeEditingImage(idx) {

        saveImage();

        this.editingImage = this.ImagesArr[idx];
    }


    saveImage() {
        if (this.editingImage.IsEmpty()) return "nothing changed";
        fetch('/save-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: this.editingImage.getJsonifyData()
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        return "successed";
    }

    setMode(mode) {
        this.editingImage.changeMode(mode);
    }

    downloadImage() {
        this.editingImage.DownLoad();
    }

    setCanvasResolution() {
        this.editingImage.setCanvasResolution();
    }

    async fetchImageData() {
        try {
            // 等待异步请求完成，获取图像数据
            const response = await fetch('/get-images', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (this.isInitialized) return;  // 如果已经初始化过，直接返回
            this.isInitialized = true;
            // 解析响应数据为 JSON
            const data = await response.json();

            // 如果存在错误，打印并退出
            if (data.error) {
                console.error('Error fetching image data:', data.error);
                return;
            }

            // 处理图像数据
            data.forEach(canvasData => {
                this.constructByJsonData(canvasData);  // 使用获取到的canvas数据构建图像
            });

            // 在数据加载完成后，检查 ImagesArr 是否为空
            if (this.ImagesArr.length == 0) {
                this.editingImage = new MyImage(this.ImagesArr.length + 1, 1280, 720);
                this.ImagesArr.push(this.editingImage);  // 将新图像对象添加到数组中
            } else {
                this.editingImage = this.ImagesArr[this.ImagesArr.length - 1];  // 选择最后一个图像对象
            }

        } catch (error) {
            // 捕获任何异步操作中的错误
            console.error('Error:', error);
        }
    }


    constructByJsonData(canvasData) {
        let tempImage = new MyImage(canvasData.canvasId, canvasData.width, canvasData.height);
        canvasData.elements.forEach(element => {
            tempImage.addElement(element.src, element.x, element.y, element.rotation);
        });
        this.ImagesArr.push(tempImage);
    }
}
