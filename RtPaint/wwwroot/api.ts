namespace RtPaint {
    export function NN<T>(t: T | null | undefined) {
        if (t === null || t === undefined)
            throw new Error("t should not be null or undefined.");
        return t;
    }

    export class Api {
        create() {
            return Http.post<number>("");
        }

        get<PaintDto>(paintId: number) {
            return Http.get(paintId.toString());
        }

        createBrush(paintId: number, pen: BrushDto) {
            return Http.post<number>(`${paintId}/createBrush`, pen);
        }

        back(paintId: number) {
            return Http.post<void>(`${paintId}/back`);
        }

        forward(paintId: number) {
            return Http.post<void>(`${paintId}/forward`);
        }

        deleteBrush(paintId: number, brushId: number) {
            return Http.post<void>(`${paintId}/deleteBrush/${brushId}`);
        }

        clear(paintId: number) {
            return Http.post<number>(`${paintId}/clear`);
        }
    }

    class Http {
        static baseUrl = "/api/RtPaint/";

        static async post<T>(path: string, data?: Object) {
            let url = Http.baseUrl + path;
            let response = await fetch(url, {
                method: "post",
                body: data
            });

            if (!response.ok)
                throw response;

            return <T>await response.json();
        }

        static async get<T>(path: string) {
            let url = Http.baseUrl + path;
            let response = await fetch(url, {
                method: "get"
            });

            if (!response.ok)
                throw response;

            return <T>await response.json();
        }
    }
}