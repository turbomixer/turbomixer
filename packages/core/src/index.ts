import {Context} from "cordis";
import {ProjectManager} from "./project";

declare module "."{
    interface Context{
        project:ProjectManager
    }
}

export {Context as App}

export * from './api'
export * from './app'
export * from './counter'
export * from './document'
export * from './editor'
export * from './utils'
export * from './project'