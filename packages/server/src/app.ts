import {Context} from "cordis";
import {ServerProjectManager} from "./project";

export {Context, Service} from 'cordis'

export namespace App{
    export interface Config extends Context.Config{

    }
}

export class App extends Context<App.Config>{
    constructor(config?:App.Config) {
        super(config);
        this.plugin(ServerProjectManager);
    }
}

export function createTurboMixerServer(config?:App.Config){
    const app = new App(config)
    app.start()
    return app;
}

export type {Events} from 'cordis'