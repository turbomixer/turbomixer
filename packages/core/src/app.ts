import {Context} from "cordis";
import {ClientService} from "./client";
import {EditorService} from "./editor";
import {FileService} from "./file";
import {NavigationService} from "./navigation";

export {Context,Service} from 'cordis'

export namespace App{
    export interface Config extends Context.Config{

    }
}

export class App extends Context<App.Config>{
    constructor(config?:App.Config) {
        super(config);
        this.plugin(ClientService);
        this.plugin(EditorService);
        this.plugin(FileService);
        this.plugin(NavigationService);
    }
}

export function createTurbomixer(config?:App.Config){
    const app = new App(config)
    app.start()
    return app;
}

    export type {Events} from 'cordis'