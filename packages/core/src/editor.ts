import {ApiRegistry, Document, Service} from ".";
import {Context} from "cordis";
import {BehaviorSubject, combineLatest, map, Subject} from "rxjs";
import * as events from "events";

declare module '.'{
    interface Context{
        editor:EditorManager
    }
}

export interface Editor{
    load(document:Document):void;
    save():Document;
    clear():void;
}

export interface EditorFactory{
    new(ctx:Context,api_registry:ApiRegistry):Editor;
}

export class EditorManager extends Service {

    constructor(ctx:Context) {
        super(ctx,'editor');
        ctx.on('project:update',()=>{
            this.editor.next(null);
            this.document.next(null);

        })
    }

    protected registry : Map<string,Editor> = new Map();

    protected api_registry : ApiRegistry = new ApiRegistry();

    protected editor : BehaviorSubject<Editor | null> = new BehaviorSubject<Editor | null>(null);

    protected document : BehaviorSubject<Document | null> = new BehaviorSubject<Document | null>(null);

    protected editor_channel : Subject<{name:string,editor:Editor,type:'new'|'remove'}> = new Subject<{name:string,editor: Editor; type: 'new'|'remove'}>();

    register(name:string,factory:EditorFactory){
        if(this.registry.has(name))
            this.unregister(name);
        this.registry.set(name,new factory(this.ctx,this.api_registry));
        (this.caller??this.ctx).on('dispose',()=>{
            this.unregister(name);
        })
        this.editor_channel.next({
            type:'new',
            name,
            editor:this.registry.get(name) as Editor
        });
    }

    unregister(name:string){
        if(!this.registry.has(name)){
            return;
        }
        if(this.registry.get(name) == this.editor.value && this.editor.value != null){
            this.close();
        }
        this.editor_channel.next({
            type:'remove',
            name,
            editor:this.registry.get(name) as Editor
        });
        this.registry.delete(name);
    }

    open(name:string,document:Document){
        if(!this.registry.has(name))
            return;
        if(this.registry.get(name) != this.editor.value)
            this.editor.next(this.registry.get(name) as Editor);
        this.document.next(document);
    }

    close(){
        this.document.next(null);
        this.editor.next(null);
    }

    save():Document|null{
        return this.editor.value?.save() ?? null;
    }

    getEditorObservable(){
        return this.editor.asObservable();
    }

    using<S extends Editor = Editor>(name:string):BehaviorSubject<S|null>{
        const subject:BehaviorSubject<S | null> = new BehaviorSubject<S | null>(null);

        const subscriber = this.editor_channel.subscribe((editor)=>{
            console.info("Editor changed:",editor)
            if(editor.name == name){
                subject.next(editor.type == 'remove' ? null : editor.editor as S);
            }
        })

        subject.subscribe({
            complete(){
                subscriber.unsubscribe();
            }
        });

        if(this.registry.get(name))
            subject.next(this.registry.get(name) as S ?? null);
        console.info(this.registry.get(name),name)

        return subject;
    }
}