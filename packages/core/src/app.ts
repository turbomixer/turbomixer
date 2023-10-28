import {Context} from "cordis";
import {EditorManager} from "./editor";
import {ProjectManager} from "./project";

export namespace App{
    export interface Config extends Context.Config{

    }
}

export class App extends Context<App.Config>{
    constructor(config?:App.Config) {
        super(config);
        this.plugin(ProjectManager);
        this.plugin(EditorManager);
    }
}

export function createTurbomixer(config?:App.Config){
    const app = new App(config)
    app.start()
    return app;
}

export {Context,Service} from 'cordis'

export type {Events} from 'cordis'