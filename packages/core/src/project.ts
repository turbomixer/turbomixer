import {Context, RuntimeInfo, Service} from ".";
import {DirectoryAccessor} from "./file";
import {BehaviorSubject} from "rxjs";
import {Runtime} from "./runtime";

export interface ProjectDescriptor{
    id:string
    name:string
}

declare module "."{
    interface Context{
        project:Project<Context>
    }
}

export abstract class Project<C extends Context> extends Service{

    protected constructor(
        protected ctx:C
    ) {
        super(ctx,'project');
    }

    abstract file?: DirectoryAccessor;

    abstract project_name: BehaviorSubject<string>;


    abstract listRuntimes():Promise<RuntimeInfo[]>;

    abstract getRuntime(id:string):Runtime<this>;

    // abstract setSettings(key:string,data:any):Awaitable<void>;

    // abstract getSettings(key:string):Awaitable<any>;

    // abstract observeSettings(key:string):Awaitable<BehaviorSubject<any>>;
}