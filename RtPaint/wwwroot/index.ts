namespace RtPaint {
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

        start(x: number, y: number) {
            this.capturing = true;
            this.brushes.push(new PencilBrush(this.currentSize, this.currentColor));

            this.moveTo(x, y);
        }

        end(x: number, y: number) {
            this.moveTo(x, y);
            this.capturing = false;
        }

        moveTo(x: number, y: number) {
            if (this.capturing) {
                let brush = this.brushes[this.brushes.length - 1];
                brush.moveTo(x, y);
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
            dom.onStart((x, y) => this.brushMgr.start(x, y));
            dom.onEnd((x, y) => this.brushMgr.end(x, y));
            dom.onMove((x, y) => this.brushMgr.moveTo(x, y));

            dom.onBack(() => this.brushMgr.back());
            dom.onForward(() => this.brushMgr.forward());

            dom.onColor(c => this.brushMgr.setColor(c));
            dom.onSize(s => this.brushMgr.setSize(s));
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
}