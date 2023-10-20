import {Service} from ".";
import {Subject} from "rxjs";
import {DirectoryAccessor} from "./file";
import {Context} from "cordis";

export interface ProjectIdentifier{
    provider:string
    id:string
    name:string
    path?:string
}
export interface Project{
    name:Subject<string>
    description:Subject<string | null>
    dependencies:Subject<string[]>
    files:DirectoryAccessor
}

export interface ProjectProvider<P extends Project = Project>{
    id:string
    name?:string
    list():Promise<ProjectIdentifier[]>
    open(identifier:ProjectIdentifier):Promise<P>
    create?(name:string):Promise<ProjectIdentifier>
    close(project:P):Promise<void>
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

    extension_map : Map<string,string> = new Map();

    constructor(ctx:Context) {
        super(ctx,'project');
    }

    current : Project | null = null
    currentIdentifier : ProjectIdentifier | null = null

    protected providers : Map<string,ProjectProvider> = new Map();

    register(provider:ProjectProvider){
        this.providers.set(provider.id,provider);
    }

    unregister(provider:ProjectProvider){
        this.providers.delete(provider.id)
    }

    async list() {
        let values = await Promise.allSettled<ProjectIdentifier[]>(
            Array.from(this.providers.values()).map(provider => provider.list())
        );
        return values
            .filter(value => value.status == 'fulfilled')
            .map((value) => (value as PromiseFulfilledResult<ProjectIdentifier[]>).value)
            .flat()
    }

    async open(identifier:ProjectIdentifier){
        const project = await this.providers.get(identifier.provider)?.open(identifier)
        if(project) {
            if(this.current)
                await this.providers.get(identifier.provider)?.close(this.current);
            this.currentIdentifier = identifier;
            this.current = project;
            this.ctx.emit('project:update',project)
        }
    }

}