import {Awaitable} from "./utils";
import {Service} from "./app";
import {Context} from "cordis";

export interface ProjectFile{
    lock():Awaitable<boolean>;
    unlock():Awaitable<boolean>;
    save():Awaitable<boolean>;
    load():Awaitable<string>;

    isLocked():Awaitable<boolean>
}


export interface Project{
    id:string;
    description?:string
    files:Record<string, ProjectFile>
}

export interface ProjectDelta extends Partial<Project>{
    update_type : 'full' | 'new' | 'remove'
}

export class ProjectManager extends Service{

    constructor(ctx:Context) {
        super(ctx,'project');
    }

    current : Project | null = null

    open(project:Project){
        this.current = project;
    }

    delta(delta:ProjectDelta){
        // @todo:delta update
    }
}