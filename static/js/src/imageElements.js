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
    console.log(angle);
    return angle;
}

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

const optionStatus = Object.freeze({
    MOVE: 'move',
    ROTATE: 'rotate',
    DELETE: 'deleteSelected',
    CLEAR: 'Clear'
});

class MyImage {

    constructor(canvasId, width, height) {
        this.canvasId = canvasId; // Unique identifier for this canvas
        this.width = width;
        this.height = height;
        this.elements = [];  // Store image elements (images, icons, graphics)
        this.selectedElement = null;
        this.canvas = document.getElementById(canvasId);  // Get canvas element
        this.ctx = this.canvas.getContext('2d'); // 2D drawing context

        this.currentStatus = optionStatus.MOVE;

        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Initialize event listeners
        this.initializeCanvasEvents();

        //other runtime vars
        this.startx = 0;
        this.starty = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    DownLoad() {
        temp = this.selectedElement;
        this.selectedElement = null;
        drawImages();
        // 获取 Canvas 的数据URL
        const dataURL = canvas.toDataURL("image/png");

        // 创建一个临时的下载链接
        const link = document.createElement('a');
        link.href = dataURL;  // 数据URL作为链接的 href
        link.download = 'canvas_image.png';  // 设置下载的文件名

        // 触发下载
        link.click();
        this.selectedElement = temp;
        drawImages();
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
                    drawImages();
                }
                break;
            default:
                console.log("Unknown mode");
        }
    }

    addElement(elementSrc) {
        const img = new Image();
        img.src = elementSrc;
        img.onload = function () {
            // 获取图像的实际宽度和高度
            const imageWidth = img.width;
            const imageHeight = img.height;

            // 创建 ImageElement 对象（可以根据实际需要修改参数）
            const image = new ImageElement(src, 100, 100, imageWidth, imageHeight);  // 使用实际的宽高
            this.elements.push(image);

            // 绘制所有选中的图像
            this.draw();
        };
        img.onerror = function () {
            console.error('图片加载失败:', src);
        };
    }

    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }
        this.draw();
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
                this.draw();
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
        const Y = bIsPC ? (e.clientY - rect.top) * yfactor : (e.touches[0].clientY - rect.left) * xfactor;

        // 获取 Canvas 的尺寸
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        if (this.currentStatus == optionStatus.MOVE && this.selectedElement) {
            // 计算相对于起始位置的偏移量
            const dx = X - this.startX; // 当前鼠标与起始位置的x轴偏移量
            const dy = Y - this.startY; // 当前鼠标与起始位置的y轴偏移量

            const imageWidth = this.selectedElement.width || 100; // 图像宽度，默认100
            const imageHeight = this.selectedElement.height || 100; // 图像高度，默认100


            // 更新图像的位置
            this.selectedElement.x = offsetX + dx;
            this.selectedElement.y = offsetY + dy;

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
        else if (currentStatus == optionStatus.ROTATE && this.selectedElement) {
            const imageCenterX = this.selectedElement.x + this.selectedElement.width / 2;
            const imageCenterY = this.selectedElement.y + this.selectedElement.height / 2;

            const beginAngle = { x: startX - imageCenterX, y: startY - imageCenterY };
            const currentAngle = { x: X - imageCenterX, y: Y - imageCenterY };

            this.selectedElement.angle = calculateAngleWithSign(beginAngle, currentAngle) * 180 / Math.PI;
        }
        this.draw();
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
    }

    addImage() {
        if (this.ImagesArr.length < this.maxImages) {
            this.ImagesArr.push(new MyImage(this.numImages++, 1280, 720));
        }
        else {
            alert('图像数量超过上限(50)', this.maxImages);
        }
    }

    deleteImage(idx) {
        this.ImagesArr.splice(idx, 1);
    }

    ChangeEditingImage(idx) {

        saveImage();

        this.editingImage = this.ImagesArr[idx];
    }


    saveImage() {

    }

    setMode(mode) {
        this.editingImage.changeMode(mode);
    }

    DownloadImage() {
        this.editingImage.DownLoad();
    }
}
