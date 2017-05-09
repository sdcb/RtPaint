var Dom = (function () {
    function Dom() {
        var _this = this;
        this.canvas = document.querySelector("canvas");
        this.backButton = document.querySelector("#backButton");
        this.forwardButton = document.querySelector("#forwardButton");
        this.toolbar = document.querySelector("#toolbar");
        this.openbar = document.querySelector("#openbar");
        this.openButton = document.querySelector("#openButton");
        this.closeButton = document.querySelector("#closeButton");
        this.openButton.addEventListener("click", function () { return _this.toggleOpenBar(); });
        this.closeButton.addEventListener("click", function () { return _this.toggleOpenBar(); });
    }
    Dom.prototype.toggleOpenBar = function () {
        this.toolbar.classList.toggle("bar-fade");
        this.openbar.classList.toggle("bar-fade");
    };
    Dom.prototype.onBack = function (backCb) {
        this.backButton.addEventListener("click", function () { return backCb(); });
        addEventListener("keyup", function (e) {
            if (e.key === "ArrowLeft")
                backCb();
        });
    };
    Dom.prototype.onForward = function (forwardCb) {
        this.forwardButton.addEventListener("click", function () { return forwardCb(); });
        addEventListener("keyup", function (e) {
            if (e.key === "ArrowRight")
                forwardCb();
        });
    };
    Dom.prototype.onColor = function (setColor) {
        var colorButtons = document.querySelectorAll("#colorGroup button");
        var colorIndicator = document.querySelector("#colorGroup .indicator");
        function doSet(color) {
            setColor(color);
            colorIndicator.style.backgroundColor = color;
        }
        var _loop_1 = function (i) {
            var btn = colorButtons[i];
            btn.addEventListener("click", function () {
                doSet(getComputedStyle(btn, null).backgroundColor);
            });
        };
        for (var i = 0; i < colorButtons.length; ++i) {
            _loop_1(i);
        }
        document.addEventListener("keypress", function (e) {
            switch (e.key) {
                case "r":
                    return doSet("red");
                case "g":
                    return doSet("green");
                case "b":
                    return doSet("blue");
                case "y":
                    return doSet("yellow");
                case "p":
                    return doSet("purple");
                case "z":
                    return doSet("black");
            }
        });
    };
    Dom.prototype.onSize = function (setSize) {
        var sizeButtons = document.querySelectorAll("#sizeGroup button");
        var sizeIndicator = document.querySelector("#sizeGroup .indicator");
        function doSet(size) {
            setSize(size);
            sizeIndicator.innerText = size.toString();
        }
        var _loop_2 = function (i) {
            var btn = sizeButtons[i];
            btn.addEventListener("click", function () {
                doSet(parseFloat(btn.innerText));
            });
        };
        for (var i = 0; i < sizeButtons.length; ++i) {
            _loop_2(i);
        }
        addEventListener("keypress", function (e) {
            if (!isNaN(parseInt(e.key))) {
                doSet(parseInt(e.key));
            }
        });
    };
    return Dom;
}());
var dom = new Dom();
var PencilBrush = (function () {
    function PencilBrush(size, color) {
        this.size = size;
        this.color = color;
        this.path = Array();
    }
    PencilBrush.prototype.moveTo = function (x, y) {
        this.path.push(x, y);
    };
    return PencilBrush;
}());
PencilBrush.lineCap = "round";
PencilBrush.lineJoin = "round";
var BrushManager = (function () {
    function BrushManager() {
        this.brushes = Array();
        this.backBrushes = Array();
        this.capturing = false;
        this.currentSize = 3;
        this.currentColor = "black";
    }
    BrushManager.prototype.start = function (e) {
        e.preventDefault();
        this.capturing = true;
        this.brushes.push(new PencilBrush(this.currentSize, this.currentColor));
        this.write(e);
    };
    BrushManager.prototype.end = function (e) {
        this.write(e);
        this.capturing = false;
    };
    BrushManager.prototype.write = function (e) {
        if (this.capturing) {
            var brush = this.brushes[this.brushes.length - 1];
            if (e instanceof MouseEvent) {
                brush.moveTo(e.offsetX, e.offsetY);
            }
            else if (e instanceof TouchEvent && e.touches.length > 0) {
                var touch = e.touches[0];
                var rect = dom.canvas.getBoundingClientRect();
                brush.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        }
    };
    BrushManager.prototype.back = function () {
        if (this.brushes.length > 0) {
            this.backBrushes.push(this.brushes.pop());
        }
    };
    BrushManager.prototype.forward = function () {
        if (this.backBrushes.length > 0) {
            this.brushes.push(this.backBrushes.pop());
        }
    };
    BrushManager.prototype.draw = function (ctx) {
        ctx.save();
        ctx.lineCap = PencilBrush.lineCap;
        ctx.lineJoin = PencilBrush.lineJoin;
        for (var _i = 0, _a = this.brushes; _i < _a.length; _i++) {
            var brush = _a[_i];
            ctx.beginPath();
            ctx.lineWidth = brush.size;
            if (brush.path.length >= 2) {
                ctx.moveTo(brush.path[0], brush.path[1]);
                for (var i = 2; i < brush.path.length; i += 2)
                    ctx.lineTo(brush.path[i], brush.path[i + 1]);
            }
            ctx.strokeStyle = brush.color;
            ctx.stroke();
        }
        ctx.restore();
    };
    BrushManager.prototype.setColor = function (color) {
        this.currentColor = color;
    };
    BrushManager.prototype.setSize = function (size) {
        this.currentSize = size;
    };
    return BrushManager;
}());
var Renderer = (function () {
    function Renderer() {
        var _this = this;
        this.brushMgr = new BrushManager();
        this.ctx = dom.canvas.getContext("2d");
        this.resize();
        // window: 
        addEventListener("resize", function () { return _this.resize(); });
        // start: 
        dom.canvas.addEventListener("mousedown", function (e) { return _this.brushMgr.start(e); });
        dom.canvas.addEventListener("touchstart", function (e) { return _this.brushMgr.start(e); });
        // end: 
        dom.canvas.addEventListener("mouseup", function (e) { return _this.brushMgr.end(e); });
        dom.canvas.addEventListener("mouseout", function (e) { return _this.brushMgr.end(e); });
        dom.canvas.addEventListener("touchend", function (e) { return _this.brushMgr.end(e); });
        // write: 
        dom.canvas.addEventListener("mousemove", function (e) { return _this.brushMgr.write(e); });
        dom.canvas.addEventListener("touchmove", function (e) { return _this.brushMgr.write(e); });
        dom.onBack(function () { return _this.brushMgr.back(); });
        dom.onForward(function () { return _this.brushMgr.forward(); });
        dom.onColor(function (c) { return _this.brushMgr.setColor(c); });
        dom.onSize(function (s) { return _this.brushMgr.setSize(s); });
    }
    Renderer.prototype.resize = function () {
        dom.canvas.width = innerWidth;
        dom.canvas.height = innerHeight;
    };
    Renderer.prototype.render = function () {
        var _this = this;
        this.draw();
        requestAnimationFrame(function () { return _this.render(); });
    };
    Renderer.prototype.draw = function () {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
        this.brushMgr.draw(this.ctx);
    };
    return Renderer;
}());
var r = new Renderer();
r.render();
window["r"] = r;
//# sourceMappingURL=index.js.map