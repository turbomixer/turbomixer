import {Editor} from "./editor";
import {DirectoryAccessor, FileAccessor} from "./file";
import {Service,Context} from ".";

declare module "."{
    interface Context{
        compiler: CompilerService
    }
}
export abstract class Compiler extends Service{

    static readonly inject = ['compiler'];

    protected constructor(protected ctx:Context,protected editor:string,protected target:string,protected platform:string) {
        super(ctx,'compiler:'+editor+'/'+target+'_'+platform);
    }

    protected async start(): Promise<void> {
        this.ctx.compiler.register(this.editor,this.target,this.platform,this);
    }

    protected async stop():Promise<void>{
        this.ctx.compiler.unregister(this.editor,this.target,this.platform);
    }

    abstract build(file:FileAccessor,base:DirectoryAccessor):any;
}

export class CompilerService extends Service{
    constructor(ctx:Context) {
        super(ctx,'compiler');
    }

    compilers : Map<string,Compiler> = new Map<string, Compiler>();

    register(editor:string,target:string,platform:string,instance:Compiler){
        this.compilers.set(editor+'/'+target+'_'+platform,instance);
    }

    unregister(editor:string,target:string,platform:string){
        this.compilers.delete(editor+'/'+target+'_'+platform);
    }
}