namespace RtPaint {
    let dom = new Dom();
    let api = new Api();

    class PencilBrush implements BrushDto {
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

        static fromDto(dto: BrushDto) {
            let r = new PencilBrush(dto.size, dto.color);
            r.path = dto.path;
            return r;
        }
    }

    const DefaultSize = 3;
    const DefaultColor = "black";
    class BrushManager {
        brushes = Array<PencilBrush>();
        forwardBrushes = Array<PencilBrush>();
        capturing = false;
        currentSize = DefaultSize;
        currentColor = DefaultColor;

        constructor(private paintId: number) {
            api.get(paintId).then(dto => {
                this.currentColor = dto.currentColor;
                this.currentSize = dto.currentSize;
                for (let brush of dto.brushes) {
                    this.brushes.push(PencilBrush.fromDto(brush));
                }
                for (let brush of dto.forwardBrushes) {
                    this.forwardBrushes.push(PencilBrush.fromDto(brush));
                }
            });
        }

        start(x: number, y: number) {
            this.capturing = true;
            this.brushes.push(new PencilBrush(this.currentSize, this.currentColor));

            this.moveTo(x, y);
        }

        end(x?: number, y?: number) {
            if (this.capturing) {
                if (x !== undefined && y !== undefined) {
                    this.moveTo(x, y);
                }
                
                this.capturing = false;
                api.createBrush(this.paintId, this.brushes[this.brushes.length - 1]);
            }
        }

        moveTo(x: number, y: number) {
            if (this.capturing) {
                let brush = this.brushes[this.brushes.length - 1];
                brush.moveTo(x, y);
            }
        }

        back() {
            if (this.brushes.length > 0) {
                this.forwardBrushes.push(NN(this.brushes.pop()));
                api.back(this.paintId);
            }
        }

        forward() {
            if (this.forwardBrushes.length > 0) {
                this.brushes.push(NN(this.forwardBrushes.pop()));
                api.forward(this.paintId);
            }
        }

        setColor(color: string) {
            this.currentColor = color;
            api.updateColor(this.paintId, color);
        }

        setSize(size: number) {
            this.currentSize = size;
            api.updateSize(this.paintId, size);
        }
    }

    class Renderer {
        ctx = NN(dom.canvas.getContext("2d"));

        constructor(private brushMgr: BrushManager) {
        }

        render() {
            this.draw();
            requestAnimationFrame(() => this.render());
        }

        draw() {
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
            
            this.ctx.save();
            this.ctx.lineCap = PencilBrush.lineCap;
            this.ctx.lineJoin = PencilBrush.lineJoin;
            for (let brush of this.brushMgr.brushes) {
                this.ctx.beginPath();
                this.ctx.lineWidth = brush.size;

                if (brush.path.length >= 2) {
                    this.ctx.moveTo(brush.path[0], brush.path[1]);
                    for (let i = 2; i < brush.path.length; i += 2)
                        this.ctx.lineTo(brush.path[i], brush.path[i + 1]);
                }
                this.ctx.strokeStyle = brush.color;
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    async function main() {
        let paintId = getUrlQuery("paintId");
        if (paintId === null) {
            let paintId = await api.create(DefaultSize, DefaultColor);
            location.replace(`?paintId=${paintId}`);
        } else {
            let brushMgr = new BrushManager(parseInt(paintId));
            let r = new Renderer(brushMgr);

            dom.onStart((x, y) => brushMgr.start(x, y));
            dom.onEnd((x, y) => brushMgr.end(x, y));
            dom.onMove((x, y) => brushMgr.moveTo(x, y));

            dom.onBack(() => brushMgr.back());
            dom.onForward(() => brushMgr.forward());

            dom.onColor(c => brushMgr.setColor(c));
            dom.onSize(s => brushMgr.setSize(s));

            r.render();
            window["r"] = r;
            window["b"] = brushMgr;
        }
    }

    main();
}