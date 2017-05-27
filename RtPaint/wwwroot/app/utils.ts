namespace RtPaint {
    export function NN<T>(t: T | null | undefined) {
        if (t === null || t === undefined)
            throw new Error("t should not be null or undefined.");
        return t;
    }

    export function getUrlQuery(name: string) {
        let url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    export function Q<T>(jQueryPromise: JQueryPromise<T>) {
        return new Promise<T>((res, rej) => {
            jQueryPromise
                .then(v => res(v))
                .fail(v => rej(v));
        });
    }
}