interface SignalR {
    paintHub: PaintHubProxy
}

interface PaintHubProxy {
    client: PaintHubClient;
    server: PaintHubServer;
}

interface PaintHubClient {
    start(x: number, y: number);
    moveTo(x: number, y: number);
    end(x?: number, y?: number);
    forward();
    back();
    setColor(color: string);
    setSize(size: number);
}

interface PaintHubServer {
    join(paintId: number): JQueryPromise<void>;
    start(paintId: number, x: number, y: number): JQueryPromise<void>;
    moveTo(paintId: number, x: number, y: number): JQueryPromise<void>;
    end(paintId: number, x?: number, y?: number): JQueryPromise<void>;
    forward(paintId: number): JQueryPromise<void>;
    back(paintId: number): JQueryPromise<void>;
    setColor(paintId: number, color: string): JQueryPromise<void>;
    setSize(paintId: number, size: number): JQueryPromise<void>;
}