import {
    Awaitable,
    Client,
    Context,
    DirectoryAccessor,
    FileAccessor,
    FileResourceAccessor,
    Project,
    ProjectDescriptor,
    ProjectDirectoryChildren,
    Runtime, RuntimeInfo,
    RuntimeStatus
} from "@turbomixer/core";
import axios, {Axios, AxiosRequestConfig} from 'axios'
import type {ForkScope} from 'cordis'
import {Manager as SocketManager, Manager, Socket} from "socket.io-client";
import {BehaviorSubject, combineLatest, firstValueFrom, map, mergeMap, Observable} from 'rxjs'
import {} from '@turbomixer/loader'

export interface TurboMixerOfficialClientConfig{
    server:string,
    token?:string,
    axios?:Axios
}

export class TurboMixerOfficialClient extends Client{


    protected readonly client: Axios;

    protected readonly socket: SocketManager;

    constructor(ctx:Context,protected config:TurboMixerOfficialClientConfig) {
        super(ctx,"turbomixer-official:"+config.server);
        this.client = config.axios ?? axios.create({
            baseURL: config.server
        });
        this.socket = new Manager(config.server,{
            autoConnect:false
        });
        this.socket.on('open',()=>this.online = true);
        this.socket.on('close',()=>this.online = false);
        this.name = "TurboMixer客户端"
    }

    start(): Awaitable<void> {
        return undefined;
    }

    stop(): Awaitable<void> {
        return undefined;
    }

    async connect(): Promise<void> {
        await new Promise<void>((resolve,reject)=>this.socket.connect((err)=>{
            if(err)
                reject(err);
            resolve();
        }))
        return;
    }

    disconnect(): Awaitable<void> {
        this.socket._close();
    }

    async list(): Promise<ProjectDescriptor[]> {
        return (await this.client.get('/projects')).data;
    }

    open(id: string) {
        const plugin = this.ctx.plugin(TurboMixerOfficialClientProject,{
            client:this.client,
            id,
            tm_client:this
        });
        return ()=>plugin.dispose();
    }

    createChannel(id: string){
        return this.socket.socket("/projects/"+id);
    }
}

export interface TurboMixerOfficialClientProjectConfig{
    client:Axios,
    id:string,
    tm_client:TurboMixerOfficialClient
}

export interface TurboMixerProjectInformation{
    name:string
    plugins?:Record<any, any>
}

export class TurboMixerOfficialClientProject extends Project<Context>{

    file?: DirectoryAccessor;

    socket?:Socket

    id: string

    client: Axios

    project_name : BehaviorSubject<string> = new BehaviorSubject<string>("")

    tm_client: TurboMixerOfficialClient;

    protected file_provider? : FileResourceAccessor

    plugins : Record<string, ForkScope> = {}

    constructor(protected ctx:Context,protected config:TurboMixerOfficialClientProjectConfig) {
        super(ctx);
        this.client = config.client;
        this.id = config.id;
        this.tm_client = config.tm_client;
    }

    async start(): Promise<void> {
        const configure = (await this.get("")).data as TurboMixerProjectInformation;
        this.project_name.next(configure.name);
        this.socket = this.tm_client.createChannel(this.id);
        let pluginUpdate = (plugins:Record<string, any>)=>{
            let clientPluginKeys = Object.keys(this.plugins);
            let serverPluginKeys = Object.keys(plugins);
            let newPlugins = serverPluginKeys.filter((key)=>clientPluginKeys.indexOf(key) == -1);
            let disposePlugins = clientPluginKeys.filter((key)=>serverPluginKeys.indexOf(key) == -1)
            newPlugins.forEach(async (id)=>{
                const plugin = await this.client.get('/plugins/'+plugins[id].entry,{
                    responseType:"text"
                });

                this.plugins[id] = this.ctx.plugin({
                    apply(ctx:Context){
                        ctx.module.load(id,plugin.data);
                        console.info("Loading:"+id);
                        ctx.inject(['module:'+id],(ctx)=>{
                            console.info("Loaded:"+id);
                            let module = (ctx as any)['module:'+id];
                            console.info(module);
                            ctx.plugin(module.default ?? module);
                        })
                    }
                })
            })
            disposePlugins.forEach((id)=>{
                this.plugins[id].dispose()
            })
        };
        this.socket.on('plugin',pluginUpdate)
        if(configure.plugins)
            pluginUpdate(configure.plugins);

        this.socket.connect();
        this.file = new TurboMixerOfficialClientProjectDirectoryAccessor(this.ctx,"/",this);
        this.ctx.file.register(this.file_provider = {
            name:this.name,
            root:this.file
        });
    }

    stop(): Awaitable<void> {
        if(this.file_provider)
            this.ctx.file.unregister(this.file_provider);
        this.socket?.disconnect();
        this.socket?.offAny();
        this.project_name.complete();
        Object.values(this.plugins).forEach(plugin=>plugin.dispose());
    }

    get(url:string,config?:AxiosRequestConfig){
        return this.client.get("/projects/"+this.id+url,config);
    }

    post(url:string,data:any,config?:AxiosRequestConfig){
        return this.client.post("/projects/"+this.id+url,data,config);
    }

    delete(url:string,config?:AxiosRequestConfig){
        return this.client.delete("/projects/"+this.id+url,config);
    }

    getSocket(){
        return this.socket as Socket
    }

    getRuntime(id: string): Runtime<this> {
        return new TurboMixerOfficialRuntime(this,id);
    }

    async listRuntimes(): Promise<RuntimeInfo[]> {
        return this.client.get('/runtimes');
    }
}

export class TurboMixerOfficialClientProjectDirectoryAccessor extends DirectoryAccessor{

    constructor(protected ctx:Context,name:string,protected project:TurboMixerOfficialClientProject,parent?:DirectoryAccessor) {
        super(ctx,name,parent);
    }

    getPath(){
        return firstValueFrom(this.path);
    }

    directory(name: string): TurboMixerOfficialClientProjectDirectoryAccessor {
        return new TurboMixerOfficialClientProjectDirectoryAccessor(this.ctx,name,this.project,this);
    }

    file(name: string): FileAccessor {
        return new TurboMixerOfficialFileAccessor(this.ctx,this,name);
    }

    async list(): Promise<ProjectDirectoryChildren[]> {
        return (await this.project?.get("/files/"+(await this.getPath()),{
            headers:{
                'Accept':'application/directory+json'
            }
        }))?.data;
    }

    async watch(): Promise<BehaviorSubject<ProjectDirectoryChildren[]>> {
        const watcher = new BehaviorSubject<ProjectDirectoryChildren[]>(await this.list());

        let server_socket = this.project.getSocket()

        let subscription_result = {id:null};

        try{
            subscription_result = await server_socket.timeout(1500).emitWithAck("file/watch-directory",await this.getPath());
        }catch (e){
            return watcher;
        }

        if(!subscription_result['id'])
            return watcher;

        const client_subscription_callback = async ()=>{
            watcher.next(await this.list())
        }

        server_socket.on("file/watch-directory:"+subscription_result['id'],client_subscription_callback);

        let disposed = false;

        const dispose = ()=>{
            if(disposed)
                return;
            server_socket.off("file/watch-directory:"+subscription_result['id'],client_subscription_callback);
            server_socket.emit("file/unwatch-directory",subscription_result['id'])
            disposed = true;
        }

        watcher.subscribe({
            complete(){
                dispose();
            }
        })

        return watcher
    }

    getProject(){
        return this.project;
    }
}

export class TurboMixerOfficialFileAccessor implements FileAccessor{

    name: BehaviorSubject<string>

    path:Observable<string>;

    directory:BehaviorSubject<TurboMixerOfficialClientProjectDirectoryAccessor>;
    constructor(
        protected ctx: Context,
        directory: TurboMixerOfficialClientProjectDirectoryAccessor,
        name: string
    ) {
        this.name = new BehaviorSubject(name);
        this.directory = new BehaviorSubject(directory);
        this.path = combineLatest({
            name:this.name,
            parent:this.directory
                .pipe(
                    mergeMap(value => (value?.path) ?? DirectoryAccessor.EmptyObserver)
                )
        }).pipe(map(({name,parent})=>{
            if(name.startsWith("/") || !parent){
                return name;
            }
            if(parent.endsWith("/"))
                return parent + name;
            return parent + "/" + name;
        }))
    }

    getPath(){
        return firstValueFrom(this.path);
    }

    close(): void {
    }

    async read(): Promise<ArrayBuffer> {
        return (await this.directory.value.getProject().get('/files'+await this.getPath()+'?method=read',{
            responseType:'arraybuffer',
            headers:{
                'Accept':'application/octet-stream'
            }
        })).data;
    }

    watch(callback: () => void): Promise<() => void> {
        return Promise.resolve(function () {
        });
    }

    async write(data: ArrayBuffer): Promise<boolean> {
        (await this.directory.value.getProject().post('/files'+await this.getPath()+'?method=write',data,{
        }))
        return true;
    }
}

export class TurboMixerOfficialRuntime implements Runtime<TurboMixerOfficialClientProject>{
    status: BehaviorSubject<RuntimeStatus> = new BehaviorSubject<RuntimeStatus>(RuntimeStatus.STOPPED);
    version: BehaviorSubject<string> = new BehaviorSubject<string>("");
    updated_at: BehaviorSubject<string> = new BehaviorSubject<string>("");

    subscription: (status:RuntimeStatus)=>void

    constructor(protected client:TurboMixerOfficialClientProject,protected id:string) {
        this.subscription = (status) => {
            this.status.next(status);
        }
    }

    async connect(){
        const id = await this.client.getSocket().emitWithAck('runtime/open',this.id);
        this.client.getSocket().on('runtime/update:'+this.id,this.subscription)
    }

    async disconnect(){
        this.client.getSocket().emit('runtime/close',this.id);
        this.client.getSocket().off('runtime/update'+this.id,this.subscription)
    }

    deploy(project: TurboMixerOfficialClientProject): Promise<void> {
        return Promise.resolve(undefined);
    }

    start(): Promise<void> {
        return Promise.resolve(undefined);
    }

    stop(): Promise<void> {
        return Promise.resolve(undefined);
    }

}