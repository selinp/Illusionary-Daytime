/**
 * @param ctx: Context 绘图环境
 * @param data: Array 绘制折线图所需的数据
 * @param padding: Object 设置坐标轴到画布的边距
 * @param arrow: Object 设置箭头的宽高
 * @constructor Line 折线图构造函数
 */
function Line(ctx, data, padding, arrow) {
    this.ctx = ctx;
    this.data = data;
    this.padding = padding || {top: 10, right: 10, bottom: 10, left: 10};
    this.arrow = arrow || { width: 10, height: 20 };

    this.vertexTop = {
        x: this.padding.left,
        y: this.padding.top
    };

    this.origin = {
        x: this.padding.left,
        y: this.ctx.canvas.height - this.padding.bottom
    };

    this.vertexRight ={
        x: this.ctx.canvas.width - this.padding.right,
        y: this.ctx.canvas.height - this.padding.bottom
    };

    // 计算坐标轴的最大刻度
    this.coordWidth = this.ctx.canvas.width - this.padding.left - this.padding.right - this.arrow.height;
    this.coordHeight = this.ctx.canvas.height - this.padding.top - this.padding.bottom - this.arrow.height;


}

Line.prototype = {

    constructor: Line,

    draw: function () {
        this.drawCoord();
        this.drawLine();
    },
    
    drawCoord: function () {
        this.ctx.beginPath();
        this.ctx.moveTo(this.vertexTop.x, this.vertexTop.y);
        this.ctx.lineTo(this.vertexTop.x - this.arrow.width/2, this.vertexTop.y + this.arrow.height);
        this.ctx.lineTo(this.vertexTop.x, this.vertexTop.y + this.arrow.height/2);
        this.ctx.lineTo(this.vertexTop.x + this.arrow.width/2, this.vertexTop.y + this.arrow.height);
        this.ctx.lineTo(this.vertexTop.x, this.vertexTop.y);
        this.ctx.lineTo(this.origin.x, this.origin.y);
        this.ctx.lineTo(this.vertexRight.x, this.vertexRight.y);
        this.ctx.lineTo(this.vertexRight.x - this.arrow.height, this.vertexRight.y - this.arrow.width/2);
        this.ctx.lineTo(this.vertexRight.x - this.arrow.height/2, this.vertexRight.y);
        this.ctx.lineTo(this.vertexRight.x - this.arrow.height, this.vertexRight.y + this.arrow.width/2);
        this.ctx.lineTo(this.vertexRight.x, this.vertexRight.y);
        this.ctx.lineTo(this.origin.x, this.origin.y);
        this.ctx.closePath();

        // this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.fill();
        this.ctx.stroke();
    },
    
    drawLine: function () {
        this.ctx.beginPath();

        var self = this;

        // 计算x和y轴坐标的缩放比值：
        this.ratioX = this.coordWidth / this.data.length;
        this.ratioY = this.coordHeight / Math.max.apply(null,this.data);

        // 画点
        this.data.forEach(function (y, x) {
            // -1修复偏移
            self.ctx.fillRect(self.origin.x + (x * self.ratioX) - 1, self.origin.y - y * self.ratioY - 1, 2, 2);
        })
        // 画线
        this.data.forEach(function (y, x) {
            // -1修复偏移
            self.ctx.lineTo(self.origin.x + (x * self.ratioX), self.origin.y - y * self.ratioY);
        })

        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // map方法在调用callback函数时,会给它传递三个参数:当前正在遍历的元素, 元素索引, 原数组本身.
        // this.newArray = this.data.map(function (val, i, arr) {
        //     return val * self.ratioY - i;
        // });

    }
}


/**
 * @param ctx: Context 绘图环境
 * @param x: number 圆心x轴坐标
 * @param y: number 圆心y轴坐标
 * @param r: number 圆半径
 * @param data: Array 绘制饼图所需的数据
 * @constrcutor Pipe 饼图构造函数
 */
function Pipe(ctx, x, y, r, data) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.r = r;
    this.data = data;

    // 一组颜色
    this.colors = [ 'orange', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'peru', 'pink' ];

    // 初始化饼图开始角度
    this.startRadian = 0;
    this.endRadian = 0;
    this.sum = 0;
    this.lineRadian = 0;
    this.lineX = 0;
    this.lineY = 0;
}

Pipe.prototype = {
    constructor: Pipe,

    draw: function () {
        this.drawPipe();
    },

    // 将每个扇形数据所占的比例转化为弧度
    getRadian: function (val) {
        return val * Math.PI * 2 / this.sum;
    },

    drawPipe: function () {

        var self = this;

        // 计算数据总和
        this.data.forEach(function (obj,i) {
            self.sum += obj.val;
        })

        this.data.forEach(function (obj, i) {

            // 计算扇形的开始和结束弧度
            self.startRadian = self.endRadian;
            self.endRadian = self.startRadian + self.getRadian(obj.val);

            // 绘制饼图
            self.ctx.beginPath();
            self.ctx.moveTo(self.x, self.y);
            self.ctx.arc(self.x, self.y, self.r, self.startRadian, self.endRadian);
            self.ctx.closePath();
            self.ctx.fillStyle = self.colors[i];
            self.ctx.fill();

            // 计算扇形平分线角度及线长
            self.lineRadian = (self.endRadian - self.startRadian) / 2 + self.startRadian;
            self.lineX = self.x + (self.r + 20) * Math.cos(self.lineRadian);
            self.lineY = self.y + (self.r + 20) * Math.sin(self.lineRadian);

            // 绘制扇形的平分线
            self.ctx.beginPath();
            self.ctx.moveTo(self.x, self.y);
            self.ctx.lineTo(self.lineX, self.lineY);
            self.ctx.strokeStyle = self.colors[i];
            self.ctx.stroke();

            // 绘制每个扇形的描述文字
            self.ctx.beginPath();
            // 根据文字位置设置文字对齐方式
            if(self.lineRadian <= Math.PI / 2) {
                self.ctx.textAlign = 'left';
                self.ctx.textBaseline = 'top';
            }else if(self.lineRadian <= Math.PI) {
                self.ctx.textAlign = 'right';
                self.ctx.textBaseline = 'top';
            }else if(self.lineRadian <= Math.PI * 3 / 2) {
                self.ctx.textAlign = 'right';
                self.ctx.textBaseline = 'bottom';
            }else if(self.lineRadian <= Math.PI * 2) {
                self.ctx.textAlign = 'left';
                self.ctx.textBaseline = 'bottom';
            }
            self.ctx.fillText(obj.msg, self.lineX ,self.lineY);
        })

    }

}