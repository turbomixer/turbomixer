
import {
    AbstractFilesystemAPI,
    Context,
    DirectoryAccessor,
    FileEntity,
    Project,
    ProjectIdentifier,
    ProjectProvider
} from '@turbomixer/core';
import axios, {Axios} from "axios";
import {io, Socket} from 'socket.io-client'
import {BehaviorSubject} from 'rxjs'

export interface HttpClientProject extends Project{
    channel:Socket
}

export class FilesystemClient implements AbstractFilesystemAPI{

    constructor(protected project:string,protected client:Axios,protected socket:Socket) {

    }

    async close(handler: any): Promise<void> {
    }

    async create(file: string): Promise<void> {
        await this.client.post('/projects/' + this.project + '/files/' + file + '?method=create')
    }

    async list(directory: string): Promise<FileEntity[]> {
        return (await this.client.get('/projects/' + this.project + '/files/' + directory + '?method=list')).data
    }

    open(file: string): Promise<any> {
        return Promise.resolve(file);
    }

    async read(handler: any): Promise<ArrayBuffer> {
        return (await this.client.get('/projects/' + this.project + '/files/' + handler + '?method=read',{
            responseType:'arraybuffer'
        })).data
    }

    async watch(entityKey: string, listener: (entity: FileEntity, type: ("add" | "remove" | "rename"), newValue?: FileEntity) => void): Promise<() => Promise<void>> {
        const handler = await this.socket.emitWithAck('watch',{project:this.project,entity:entityKey});
        if(handler.id){
            const event_handler = (entity: FileEntity, type: ("add" | "remove" | "rename"), newValue?: FileEntity)=>{
                listener(entity,type,newValue)
            }
            this.socket.on('watch:'+handler.id,event_handler)
            return async()=> {
                this.socket.emit('unwatch',{project:this.project,entity:entityKey});
                this.socket.off('watch:'+handler.id,event_handler)
            }
        }
        throw new Error('Failed to watch directory');
    }

    write(handler: any, data: ArrayBuffer): Promise<void> {
        return Promise.resolve();
    }

}

export class Client implements ProjectProvider<HttpClientProject>{
    protected client: Axios;
    constructor(protected config:ClientConfig) {
        this.id = 'client:'+config.server;
        this.client = config.axios ?? axios.create({
            baseURL: config.server
        });
        this.name = config.name ?? config.server;
    }

    id: string;

    name:string;

    close(project: HttpClientProject): Promise<void> {
        project.channel.close();
        return Promise.resolve()
    }

    async list(): Promise<ProjectIdentifier[]> {
        return (await this.client.get('/projects')).data
    }

    async open(identifier: ProjectIdentifier): Promise<HttpClientProject> {
        const info = await this.client.get('/projects/'+identifier.id);
        const {name,description,server} = info.data;
        const socket = io(server);
        return {
            name: new BehaviorSubject<string>(name),
            description: new BehaviorSubject<string | null>(description),
            dependencies: new BehaviorSubject<string[]>([]),
            channel: socket,
            files: new DirectoryAccessor(new FilesystemClient(identifier.id, this.client, socket), '/')
        }
    }

}

export interface ClientConfig{
    name:string
    server:string
    axios?:Axios
    baseUrl?:string
}

export const reusable = true;

export function apply(ctx:Context,config:ClientConfig){
    ctx.using(['project'],(ctx)=>{
        ctx.project.register(new Client(config));
    })
}