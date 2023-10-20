export interface FileEntity{
    name:string,
    type:'directory' | 'file'
}
export interface AbstractFilesystemAPI<H extends any = any>{
    create(file:string):Promise<void>
    open(file:string):Promise<H>;
    close(handler:H):Promise<void>;
    write(handler:H,data:ArrayBuffer):Promise<void>;
    read(handler:H):Promise<ArrayBuffer>;
    list(directory:string):Promise<FileEntity[]>;
    watch(entityKey:string,listener:(entity:FileEntity,type:'add'|'remove'|'rename',newValue?:FileEntity)=>void):Promise<()=>Promise<void>>;
}

export class DirectoryAccessor{

    protected name:string;
    constructor(protected api:AbstractFilesystemAPI,protected absolute_path : string = '/') {
        this.name = absolute_path.split('/').pop() ?? '';
    }

    open(name:string){
        return this.api.open(this.absolute_path + '/' + name);
    }

    create(name:string){
        return this.api.create(this.absolute_path + '/' + name);
    }

    watch(callback:(entity:FileEntity,type:'add'|'remove'|'rename',newValue?:FileEntity)=>void){
        return this.api.watch(this.absolute_path,callback);
    }

    list(){
        return this.api.list(this.absolute_path);
    }

    directory(name:string):DirectoryAccessor{
        return new DirectoryAccessor(this.api,this.absolute_path + name + '/');
    }

    notifyUpdate(absolute_path:string){
        this.absolute_path = absolute_path;
        this.name = absolute_path.split('/').pop() ?? '';
    }

    path(){
        return this.absolute_path;
    }

    reference(file:string){
        return new FileReference(this,file);
    }

    raw(){
        return this.api;
    }
}

export class FileReference{
    protected handler : any = null;
    constructor(protected directory:DirectoryAccessor,protected _name:string) {
    }

    path(){
        return this.directory.path() + this._name;
    }

    name(){
        return this._name;
    }

    async open(){
        this.handler = await this.directory.open(this._name);
    }

    isOpen(){
        return !!this.handler
    }

    async write(data:ArrayBuffer){
        if(!this.handler)
            return null;
        await this.directory.raw().write(this.handler,data);
    }

    async read(){
        if(!this.handler)
            return null;
        return await this.directory.raw().read(this.handler);
    }

    async close(){
        await this.directory.raw().close(this.handler);
    }
}