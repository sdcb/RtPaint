namespace RtPaint {
    export class Api {
        create(size: number, color: string) {
            return Http.post<number>(`?size=${size}&color=${color}`);
        }

        get(paintId: number) {
            return Http.get<PaintDto>(paintId.toString());
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
                body: JSON.stringify(data), 
                headers: {
                    "Content-Type": "application/json"
                }
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