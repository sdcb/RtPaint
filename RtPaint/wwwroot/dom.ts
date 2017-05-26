namespace RtPaint {
    export class Dom {
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
            this.resize();
        }

        resize() {
            this.canvas.width = innerWidth;
            this.canvas.height = innerHeight;
            addEventListener("resize", () => this.resize());
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

        private getXy(e: MouseEvent | TouchEvent) {
            if (e instanceof MouseEvent) {
                return { x: e.offsetX, y: e.offsetY };
            } else if (e.touches.length > 0) {
                let touch = e.touches[0];
                let rect = this.canvas.getBoundingClientRect();
                return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
            }
        }

        onStart(cb: (x: number, y: number) => any) {
            let commonCallback = (e: MouseEvent | TouchEvent) => {
                e.preventDefault();
                let p = NN(this.getXy(e));
                cb(p.x, p.y);
            }

            this.canvas.addEventListener("mousedown", e => commonCallback(e));
            this.canvas.addEventListener("touchstart", e => commonCallback(e));
        }

        onMove(cb: (x: number, y: number) => any) {
            let commonCallback = (e: MouseEvent | TouchEvent) => {
                let p = NN(this.getXy(e));
                cb(p.x, p.y);
            }

            this.canvas.addEventListener("mousemove", e => commonCallback(e));
            this.canvas.addEventListener("touchmove", e => commonCallback(e));
        }

        onEnd(cb: (x?: number, y?: number) => any) {
            let commonCallback = (e: MouseEvent | TouchEvent) => {
                let p = this.getXy(e);
                p && cb(p.x, p.y);
                p || cb();
            }

            this.canvas.addEventListener("mouseup", e => commonCallback(e));
            this.canvas.addEventListener("mouseout", e => commonCallback(e));
            this.canvas.addEventListener("touchend", e => commonCallback(e));
        }
    }
}