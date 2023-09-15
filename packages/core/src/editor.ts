import {Service} from "./app";
import {Context} from "cordis";
import {Events} from "cordis";
import {Document} from "./document";

declare module '.'{
    interface Events{
        'editor.activate'(name:string,editor:Editor):void;
        'editor.deactivate'(name:string,editor:Editor):void;
    }
    interface Context{
        editor:EditorManager
    }
}

export interface CompileResult{
    files:Record<string, string>
}

export interface Editor{
    dispose():void;
    load(document:Document):void;
    compile(options:any):CompileResult;
    save():Document;
}

export interface Editors{
}

export class EditorManager extends Service{

    protected editor : Editor|null = null

    protected editor_name : string|null = null

    protected registry : Map<string,{new():Editor}> = new Map();

    constructor(ctx:Context) {
        super(ctx,'editor');
    }

    register(name:string,factory:{new():Editor}){
        this.registry.set(name,factory);
    }

    activate<T extends keyof Editors>(name:T):Editors[T]{
        if(this.editor!=null){
            this.deactivate();
        }
        const _constructor = this.registry.get(name)
        if(!_constructor)
            throw new Error('Cannot found editor '+name)
        this.editor =  new _constructor;
        this.editor_name = name;
        this.ctx.emit('editor.activate',this.editor_name as string,this.editor)
        return this.editor as Editors[T];
    }

    deactivate(){
        if(!this.editor)
            return
        this.ctx.emit('editor.deactivate',this.editor_name as string,this.editor)
        this.editor.dispose()
        this.editor = null
        this.editor_name = null;
    }
}