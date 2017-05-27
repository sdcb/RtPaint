namespace RtPaint {
    let dom = new Dom();
    let api = new Api();
    let hubClient = $.signalR.paintHub.client;
    let hubServer = $.signalR.paintHub.server;

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
        otherEdit = false;
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

        start(x: number, y: number, push = true) {
            if (push && this.otherEdit)
                return;

            this.capturing = true;
            this.brushes.push(new PencilBrush(this.currentSize, this.currentColor));

            this.moveTo(x, y);

            if (push) {
                hubServer.start(this.paintId, x, y);
            } else {
                this.otherEdit = true;
            }
        }

        end(x?: number, y?: number, push = true) {
            if (push && this.otherEdit) 
                return;

            if (this.capturing) {
                if (x && y) {
                    this.moveTo(x, y);
                }

                this.forwardBrushes = [];
                this.capturing = false;
                this.otherEdit = false;

                if (push) {
                    api.createBrush(this.paintId, this.brushes[this.brushes.length - 1]);
                    hubServer.end(this.paintId, x, y);
                }
            }
        }

        moveTo(x: number, y: number, push = true) {
            if (push && this.otherEdit)
                return;

            if (this.capturing) {
                let brush = this.brushes[this.brushes.length - 1];
                brush.moveTo(x, y);

                if (push) {
                    hubServer.moveTo(this.paintId, x, y);
                }
            }
        }

        back(push = true) {
            if (push && this.otherEdit)
                return;

            if (this.brushes.length > 0) {
                this.forwardBrushes.push(NN(this.brushes.pop()));
            }

            if (push) {
                api.back(this.paintId);
                hubServer.back(this.paintId);
            }
        }

        forward(push = true) {
            if (push && this.otherEdit)
                return;

            if (this.forwardBrushes.length > 0) {
                this.brushes.push(NN(this.forwardBrushes.pop()));
            }

            if (push) {
                api.forward(this.paintId);
                hubServer.forward(this.paintId);
            }
        }

        setColor(color: string, push = true) {
            if (push && this.otherEdit)
                return;

            this.currentColor = color;

            if (push) {
                api.updateColor(this.paintId, color);
                hubServer.setColor(this.paintId, color);
            }
        }

        setSize(size: number, push = true) {
            if (push && this.otherEdit)
                return;

            this.currentSize = size;

            if (push) {
                api.updateSize(this.paintId, size);
                hubServer.setSize(this.paintId, size);
            }
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

    async function createNew() {
        let paintId = await api.create(DefaultSize, DefaultColor);
        location.replace(`?id=${paintId}`);
    }

    async function main() {
        let paintIdUrl = getUrlQuery("id");
        if (paintIdUrl === null) {
            await createNew();
        } else {
            let paintId = parseInt(paintIdUrl);
            let brushMgr = new BrushManager(paintId);
            let r = new Renderer(brushMgr);

            await initHub(brushMgr);

            dom.onStart((x, y) => brushMgr.start(x, y));
            dom.onEnd((x, y) => brushMgr.end(x, y));
            dom.onMove((x, y) => brushMgr.moveTo(x, y));

            dom.onBack(() => brushMgr.back());
            dom.onForward(() => brushMgr.forward());

            dom.onColor(c => brushMgr.setColor(c));
            dom.onSize(s => brushMgr.setSize(s));

            dom.createNew = createNew;

            hubServer.join(paintId);

            r.render();
            window["r"] = r;
            window["b"] = brushMgr;
        }
    }

    async function initHub(brushMgr: BrushManager) {
        hubClient.start = (x, y) => brushMgr.start(x, y, false);
        hubClient.moveTo = (x, y) => brushMgr.moveTo(x, y, false);
        hubClient.end = (x, y) => brushMgr.end(x, y, false);
        hubClient.forward = () => brushMgr.forward(false);
        hubClient.back = () => brushMgr.back(false);
        hubClient.setColor = c => brushMgr.setColor(c, false);
        hubClient.setSize = s => brushMgr.setSize(s, false);
        await Q($.connection.hub.start());
    }

    main();
}