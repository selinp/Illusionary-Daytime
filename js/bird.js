// 设置窗口大小
var viewSize = (function(){

    var pageWidth = window.innerWidth,
        pageHeight = window.innerHeight;

    if (typeof pageWidth != 'number') {
        if (document.compatMode == 'CSS1Compat') {
            pageHeight = document.documentElement.clientHeight;
            pageWidth = document.documentElement.clientWidth;
        } else {
            pageHeight = document.body.clientHeight;
            pageWidth = document.body.clientWidth;
        }
    };
    if(pageWidth >= 800 && pageHeight >= 600){
        pageWidth = 800;
        pageHeight = 600;
    } else if(pageWidth >= pageHeight){
        pageWidth = pageHeight * 360 / 640;
        pageWidth = pageWidth >  414 ? 414 : pageWidth;
        pageHeight = pageHeight > 736 ? 736 : pageHeight;
    }

    return {
        width: pageWidth,
        height: pageHeight
    };

})();

// 混合继承及判断图片是否加载完毕的回调函数
var util = {
    extend: function (o1, o2) {
        for (var k in o2) {
            if (o2.hasOwnProperty(k)) {
                o1[k] = o2[k];
            }
        }
    },

    loadImage:function (imgUrl, fn) {
        imgObj = {};
        var tempImg, loaded = 0, imgLenght = 0;
        for (var key in imgUrl) {
            imgLenght++;
            tempImg = new Image;
            tempImg.src = imgUrl[key];
            imgObj[key] = tempImg;
            // 给图片加载一个监听事件
            tempImg.onload = function () {
                loaded++;
                if (loaded >= imgLenght) {
                    fn(imgObj);
                }
            }
        }
    }
}


// 主函数入口
var cvs = document.getElementById('cvs'),
    ctx = cvs.getContext('2d');

//设置画布宽高
cvs.width = viewSize.width;
cvs.height = viewSize.height;
var k = viewSize.height / 600;

util.loadImage({img: './images/img.png'},
    function (imgObj) {

        // 创建游戏场景
        drawImg = new Draw(ctx, imgObj, 2, cvs.width, cvs.height);

        var timer = setInterval(start, 25);
        function start() {
            startBtn.style.display = 'none';
            drawImg.draw();
            drawImg.drawBird();
            if (ctx.isPointInPath(drawImg.birdX + drawImg.birdWidth / 2, drawImg.birdY + drawImg.birdHeight / 2) || drawImg.birdY < 0
                || drawImg.birdY > cvs.height - drawImg.landHeight - drawImg.birdHeight) {
                clearInterval(timer);
                //画ready
                ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
                ctx.fillRect(0, 0, cvs.width, cvs.height);
                ctx.drawImage(imgObj.img, 170, 990, 300, 90, Math.ceil(viewSize.width * 0.5 - k * 277 * 0.5), Math.ceil(200 / 800 * viewSize.height), 277 * k, 75 * k)
                ctx.drawImage(imgObj.img, 550, 1005, 160, 90, Math.ceil(viewSize.width * 0.5 - k * 160 * 0.5), Math.ceil(400 / 800 * viewSize.height), 160 * k, 90 * k)
                startBtn.style.display = 'block';
                return;
            }
            ctx.beginPath();
        };

        startBtn = document.getElementById('restart');
        startBtn.style.width = 160 * k + 'px';
        startBtn.style.height = 90 * k + 'px';
        startBtn.style.left = Math.ceil(cvs.width * 0.5 - k * 160 * 0.5) + 'px';
        startBtn.style.top = Math.ceil(400 / 800 * cvs.height) + 'px';
        startBtn.style.display = 'none';
        startBtn.ontouchstart = startBtn.onmousedown = function(event){
            var e = event || window.event;
            if(e.stopPropagation){
                e.stopPropagation();
            }else{
                e.cancelBubble = false;
            }
            console.log('startBtn.onclick');
            drawImg = new Draw(ctx, imgObj, 2, cvs.width, cvs.height);
            timer = setInterval(start, 25);
        }

    });


function Draw(ctx, imgObj, speed, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.imgObj = imgObj;
    this.speed = speed || 2;
    this.cvsWidth = cvsWidth;
    this.cvsHeight = cvsHeight;

    // 天空，大地，管道的属性
    this.x = 0;
    this.y = 0;
    this.x2 = this.cvsWidth;
    this.x3 = 0; // this.pipeNum;
    this.landHeight = 112;
    this.aisleHeight = 150;
    this.pipeUp = 0;
    this.pipeDown = 0;
    this.pipeNum = 5;
    this.randomArr1 = [];
    this.randomArr2 = [];
    this.drawRandow2();

    // 小鸟的属性
    this.birdX = 25;
    this.birdY = 0;
    this.birdSpeed = 2;
    this.birdWidth = 34;
    this.birdHeight = 24;
    this.baseRadian = Math.PI /180 * 10;
    this.maxRadian = Math.PI /180 * 45;
    this.rotateRadian = Math.PI /180 * 45;
    // 当前小鸟渲染的帧数
    this.currentFrame = 0;

}

Draw.prototype = {
    constructor: Draw,

    draw: function () {
        this.x -= this.speed;
        this.x2 -= this.speed;
        this.x3 -= this.speed;
        if (this.x <= -this.cvsWidth) {
            this.x += this.cvsWidth * 2;
            this.drawRandow1();
        }
        if (this.x2 <= -this.cvsWidth) {
            this.x2 += this.cvsWidth * 2;
            this.drawRandow2();
        }
        // 绘制天空
        this.ctx.drawImage(this.imgObj.img, 0, 0, 800, 600, this.x, this.y, this.cvsWidth ,this.cvsHeight);
        this.ctx.drawImage(this.imgObj.img, 0, 0, 800, 600, this.x2, this.y, this.cvsWidth ,this.cvsHeight);
        // 绘制大地
        this.ctx.drawImage(this.imgObj.img, 0, 600, 800, this.landHeight, this.x, this.cvsHeight - this.landHeight, this.cvsWidth ,this.landHeight);
        this.ctx.drawImage(this.imgObj.img, 0, 600, 800, this.landHeight, this.x2, this.cvsHeight - this.landHeight, this.cvsWidth ,this.landHeight);

        for (var i = 0; i < this.pipeNum; i++) {
            // 随机生成管道的高度，最小高度50
            // 第一画面管道
            this.pipeUp = this.randomArr1[i] * (this.cvsHeight - this.landHeight - this.aisleHeight - 50);
            this.pipeUp = this.pipeUp < 50 ? 50 : this.pipeUp;
            this.pipeDown = this.cvsHeight - this.landHeight - this.aisleHeight - this.pipeUp;
            this.ctx.drawImage(this.imgObj.img, 70, 1170 - this.pipeUp, 52, this.pipeUp,
                this.x + this.cvsWidth / this.pipeNum * i, this.y, 52, this.pipeUp);
            this.ctx.drawImage(this.imgObj.img, 0, 750, 52, this.pipeDown,
                this.x + this.cvsWidth / this.pipeNum * i, this.y + this.pipeUp + this.aisleHeight, 52, this.pipeDown);
            this.ctx.rect(this.x + this.cvsWidth / this.pipeNum * i, this.y, 52, this.pipeUp);
            this.ctx.rect(this.x + this.cvsWidth / this.pipeNum * i, this.y + this.pipeUp + this.aisleHeight, 52, this.pipeDown);
            // 随机生成管道的高度，最小高度50
            // 第二画面管道
            this.pipeUp = this.randomArr2[i] * (this.cvsHeight - this.landHeight - this.aisleHeight - 50);
            this.pipeUp = this.pipeUp < 50 ? 50 : this.pipeUp;
            this.pipeDown = this.cvsHeight - this.landHeight - this.aisleHeight - this.pipeUp;
            this.ctx.drawImage(this.imgObj.img, 70, 1170 - this.pipeUp, 52, this.pipeUp,
                this.x2 + this.cvsWidth / this.pipeNum * i, this.y, 52, this.pipeUp);
            this.ctx.drawImage(this.imgObj.img, 0, 750, 52, this.pipeDown,
                this.x2 + this.cvsWidth / this.pipeNum * i, this.y + this.pipeUp + this.aisleHeight, 52, this.pipeDown);
            this.ctx.rect(this.x2 + this.cvsWidth / this.pipeNum * i, this.y, 52, this.pipeUp);
            this.ctx.rect(this.x2 + this.cvsWidth / this.pipeNum * i, this.y + this.pipeUp + this.aisleHeight, 52, this.pipeDown);
        }

    },

    drawRandow1: function () {
        for (var i = 0; i < this.pipeNum; i++) {
            this.randomArr1[i]  = Math.random();
        }
    },
    drawRandow2: function () {
        for (var i = 0; i < this.pipeNum; i++) {
            this.randomArr2[i]  = Math.random();
        }
    },

    drawBird: function () {
        var self = this;

        // 根据速度计算旋转的弧度
        this.rotateRadian = this.baseRadian * this.birdSpeed;
        // 限制最大旋转角度
        this.rotateRadian = this.rotateRadian >= this.maxRadian ? this.maxRadian : this.rotateRadian;
        // 保存当前状态
        this.ctx.save();

        this.birdSpeed += 0.1;

        this.birdY += this.birdSpeed;

        this.currentFrame++;
        if (this.currentFrame > 2) {
            this.currentFrame = 0;
        }

        // 绑定事件
        this.ctx.canvas.addEventListener('click', function () {
            self.birdSpeed = -2;
        })

        /*
         * 1、平移到小鸟的中心点
         * 2、然后根据下落的速度旋转坐标系
         * 3、绘制小鸟，但是绘制的x和y坐标变为负的宽高一半。
         * */
        this.ctx.translate( this.birdX + 34 / 2, this.birdY + 24 / 2 );
        this.ctx.rotate( this.rotateRadian );
        this.ctx.drawImage( this.imgObj.img, 170 + (this.birdWidth + 18) * this.currentFrame, 750,
            this.birdWidth, this.birdHeight, -this.birdWidth / 2, -this.birdHeight / 2, this.birdWidth, this.birdHeight);

        this.ctx.restore();

        // this.ctx.drawImage(this.imgObj.img, 170, 750, 34, 24, this.birdX ,this.birdY, 34, 24);
    }

}
