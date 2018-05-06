declare module "worker-loader?publicPath=./scripts/&name=jsstore.worker.js!*" {
    export default class WebpackWorker extends Worker {
        constructor();
    }

    // export = WebpackWorker;
}

declare module "file-loader?name=[name].js!*" {
    const value: string;
    export = value;
}