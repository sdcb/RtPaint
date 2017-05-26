function NN<T>(t: T | null | undefined) {
    if (t === null || t === undefined)
        throw new Error("t should not be null or undefined.");
    return t;
}

class Dom {
    canvas = NN(document.querySelector("canvas"));
    backButton = NN(document.querySelector("#backButton"));
    forwardButton = NN(document.querySelector("#forwardButton"));

    toolbar = NN(document.querySelector("#toolbar"));
    openbar = NN(document.querySelector("#openbar"));

    openButton = NN(<HTMLDivElement>document.querySelector("#openButton"));
    closeButton = NN(<HTMLDivElement>document.querySelector("#closeButton"));

    toggleOpenBar() {
        this.toolbar.classList.toggle("bar-fade");
        this.openbar.classList.toggle("bar-fade");
    }

    constructor() {
        this.openButton.addEventListener("click", () => this.toggleOpenBar());
        this.closeButton.addEventListener("click", () => this.toggleOpenBar());
    }

    onBack(backCb: () => any) {
        this.backButton.addEventListener("click", () => backCb());
        addEventListener("keyup", e => {
            if (e.key === "ArrowLeft") backCb();
        });
    }

    onForward(forwardCb: () => any) {
        this.forwardButton.addEventListener("click", () => forwardCb());
        addEventListener("keyup", e => {
            if (e.key === "ArrowRight") forwardCb();
        });
    }

    onColor(setColor: (color: string) => any) {
        let colorButtons = <NodeListOf<HTMLButtonElement>>document.querySelectorAll("#colorGroup button");
        let colorIndicator = <HTMLElement>document.querySelector("#colorGroup .indicator");

        function doSet(color: string) {
            setColor(color);
            colorIndicator.style.backgroundColor = color;
        }

        for (let i = 0; i < colorButtons.length; ++i) {
            let btn = colorButtons[i];
            btn.addEventListener("click", () => {
                doSet(NN(NN(getComputedStyle(btn)).backgroundColor));
            });
        }

        document.addEventListener("keypress", e => {
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
    }

    onSize(setSize: (size: number) => any) {
        let sizeButtons = <NodeListOf<HTMLButtonElement>>document.querySelectorAll("#sizeGroup button");
        let sizeIndicator = <HTMLElement>document.querySelector("#sizeGroup .indicator");

        function doSet(size: number) {
            setSize(size);
            sizeIndicator.innerText = size.toString();
        }

        for (let i = 0; i < sizeButtons.length; ++i) {
            let btn = sizeButtons[i];
            btn.addEventListener("click", () => {
                doSet(parseFloat(btn.innerText));
            });
        }

        addEventListener("keypress", e => {
            if (!isNaN(parseInt(e.key))) {
                doSet(parseInt(e.key));
            }
        });
    }
}

let dom = new Dom();


class PencilBrush {
    path = Array<number>();
    static lineCap = "round";
    static lineJoin = "round";

    constructor(
        public size: number,
        public color: string) {
    }

    moveTo(x: number, y: number) {
        this.path.push(x, y);
    }
}

class BrushManager {
    brushes = Array<PencilBrush>();
    backBrushes = Array<PencilBrush>();
    capturing = false;
    currentSize = 3;
    currentColor = "black";

    start(e: MouseEvent | TouchEvent) {
        e.preventDefault();

        this.capturing = true;
        this.brushes.push(new PencilBrush(this.currentSize, this.currentColor));

        this.write(e);
    }

    end(e: MouseEvent | TouchEvent) {
        this.write(e);
        this.capturing = false;
    }

    write(e: MouseEvent | TouchEvent) {
        if (this.capturing) {
            let brush = this.brushes[this.brushes.length - 1];
            if (e instanceof MouseEvent) {
                brush.moveTo(e.offsetX, e.offsetY);
            } else if (e instanceof TouchEvent && e.touches.length > 0) {
                let touch = e.touches[0];
                let rect = dom.canvas.getBoundingClientRect();
                brush.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        }
    }

    back() {
        if (this.brushes.length > 0) {
            this.backBrushes.push(NN(this.brushes.pop()));
        }
    }

    forward() {
        if (this.backBrushes.length > 0) {
            this.brushes.push(NN(this.backBrushes.pop()));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.lineCap = PencilBrush.lineCap;
        ctx.lineJoin = PencilBrush.lineJoin;
        for (let brush of this.brushes) {
            ctx.beginPath();
            ctx.lineWidth = brush.size;

            if (brush.path.length >= 2) {
                ctx.moveTo(brush.path[0], brush.path[1]);
                for (let i = 2; i < brush.path.length; i += 2)
                    ctx.lineTo(brush.path[i], brush.path[i + 1]);
            }
            ctx.strokeStyle = brush.color;
            ctx.stroke();
        }
        ctx.restore();
    }

    setColor(color: string) {
        this.currentColor = color;
    }

    setSize(size: number) {
        this.currentSize = size;
    }
}

class Renderer {
    brushMgr = new BrushManager();
    ctx = NN(dom.canvas.getContext("2d"));

    constructor() {
        this.resize();
        // window: 
        addEventListener("resize", () => this.resize());

        // start: 
        dom.canvas.addEventListener("mousedown", e => this.brushMgr.start(e));
        dom.canvas.addEventListener("touchstart", e => this.brushMgr.start(e));

        // end: 
        dom.canvas.addEventListener("mouseup", e => this.brushMgr.end(e));
        dom.canvas.addEventListener("mouseout", e => this.brushMgr.end(e));
        dom.canvas.addEventListener("touchend", e => this.brushMgr.end(e));

        // write: 
        dom.canvas.addEventListener("mousemove", e => this.brushMgr.write(e));
        dom.canvas.addEventListener("touchmove", e => this.brushMgr.write(e));
        
        dom.onBack(() => this.brushMgr.back());
        dom.onForward(() => this.brushMgr.forward());

        dom.onColor(c => this.brushMgr.setColor(c));
        dom.onSize(s => this.brushMgr.setSize(s));
    }

    resize() {
        dom.canvas.width = innerWidth;
        dom.canvas.height = innerHeight;
    }

    render() {
        this.draw();
        requestAnimationFrame(() => this.render());
    }

    draw() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
        this.brushMgr.draw(this.ctx);
    }
}

let r = new Renderer();
r.render();
window["r"] = r;