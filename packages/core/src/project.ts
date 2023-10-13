import {Awaitable} from "./utils";
import {Service} from "./app";
import {Context} from "cordis";

export interface ProjectFile{
    type: 'file'
    lock():Awaitable<boolean>;
    unlock():Awaitable<boolean>;
    save():Awaitable<boolean>;
    load():Awaitable<string>;

    isLocked():Awaitable<boolean>
}

export interface ProjectDirectory{
    type: 'directory'
    children:Record<string, ProjectFile | ProjectDirectory>
}

export interface Project{
    name:string;
    description?:string
    files:Record<string, ProjectFile | ProjectDirectory>
}

export interface ProjectDelta extends Partial<Project>{
    update_type : 'full' | 'new' | 'remove'
}

declare module "."{
    interface Events{
        'project:update'(newValue:Project):void;
    }
    interface Context{
        project:ProjectManager
    }
}

export class ProjectManager extends Service{

    constructor(ctx:Context) {
        super(ctx,'project');
    }

    current : Project | null = null

    open(project:Project){
        this.current = project;
        this.ctx.emit('project:update',project)
    }

    delta(delta:ProjectDelta){
        // @todo:delta update
    }
}