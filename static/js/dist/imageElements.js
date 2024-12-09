"use strict";
// 定义图像元素
class ImageElement {
    constructor(src, x, y, width, height, angle = 0) {
        this.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.image = new Image();
        this.image.src = src;
        this.image.onload = () => {
            this.draw();
        };
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate((this.angle * Math.PI) / 180);
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
class MyImage {
    constructor(canvasId, width, height) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
        this.elements = [];
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    addElement(element) {
        this.elements.push(element);
        this.draw();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.elements.forEach((element) => {
            element.draw(this.ctx);
        });
    }
    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index !== -1) {
            this.elements.splice(index, 1);
            this.draw();
        }
    }
    getElements() {
        return this.elements;
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
            const newImage = new MyImage(`canvas-${this.ImagesArr.length}`, 1280, 720);
            this.ImagesArr.push(newImage);
        }
        else {
            alert(`图像数量超过上限(${this.maxImages})`);
        }
    }
    deleteImage(idx) {
        this.ImagesArr.splice(idx, 1);
    }
    alterImage(idx) {
        this.saveImage();
        this.editingImage = this.ImagesArr[idx];
    }
    saveImage() {
        console.log("Save image logic here.");
    }
}
