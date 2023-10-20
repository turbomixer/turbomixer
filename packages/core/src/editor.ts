import {Service} from "./app";
import {Context} from "cordis";
import {Events} from "cordis";
import {Document} from "./document";
import {FileReference} from "./file";
import {BehaviorSubject, Observer, Subject, Subscription} from "rxjs";
import {decode} from "@msgpack/msgpack";

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
    save():Document;
}

export interface Editors{
}

export type EditorFactory = {
    new():Editor,
    init(ctx:Context,name:string):void;
}

export class EditorManager extends Service{

    protected editor : Editor|null = null

    protected editor_name : string|null = null

    protected registry : Map<string,EditorFactory> = new Map();

    protected file : BehaviorSubject<FileReference|null> = new BehaviorSubject<FileReference|null>(null);

    protected document : BehaviorSubject<Document | null> = new BehaviorSubject<Document | null>(null);

    protected managerSubscription : Subscription | null = null;

    constructor(ctx:Context) {
        super(ctx,'editor');
    }

    register(name:string,factory:EditorFactory){
        this.registry.set(name,factory);
        factory.init(this.ctx,name); // @todo disposable
    }

    activate<T extends keyof Editors>(name:T):Editors[T]{
        if(this.editor!=null){
            this.deactivate();
        }
        const _constructor = this.registry.get(name)
        if(!_constructor)
            throw new Error('Cannot found editor '+name)
        this.editor = new _constructor;
        this.editor_name = name;
        this.managerSubscription = this.file.subscribe(async (file)=>{
            if(file){
                const data = await file.read();
                if(data && data.byteLength > 3){
                    // @todo version information
                    const header = new Uint8Array(data.slice(3));
                    if(new TextDecoder().decode(header) !== 'TMF')
                        throw new Error();
                    this.editor?.load();
                }else{

                }
            }
        })
        this.ctx.emit('editor.activate',this.editor_name as string,this.editor)
        return this.editor as Editors[T];
    }

    deactivate(){
        if(!this.editor)
            return
        this.ctx.emit('editor.deactivate',this.editor_name as string,this.editor)
        this.editor.dispose()
        this.managerSubscription?.unsubscribe()
        this.editor = null
        this.editor_name = null;
    }

    mount(file:FileReference){
        this.file.next(file);
    }

    unmount(){
        this.file.next(null);
    }
}