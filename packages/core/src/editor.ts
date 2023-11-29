import {Attachable, Context, FileAccessor, NavigationEntity, Service} from ".";
import {Awaitable} from "./infrastructure/promises";
import {BehaviorSubject, Subscription} from "rxjs";
import {ReactiveMap} from "./infrastructure/reactive";
import {spawnAsync} from "yakumo";

declare module "."{
    interface Context{
        editor:EditorService
    }
    interface Events{
        'editor/changed'():void;
    }
}

export interface Editors{
    
}

export abstract class Editor<C extends Context = Context,T=any> extends Service<C>{

    static inject = ['editor'];

    protected constructor(ctx:C,name:string) {
        super(ctx,'editor:'+name);
        let disposeRegistry : null | (()=>void) = null ;
        ctx.on('ready',()=>{disposeRegistry = ctx.editor.register(name,this)});
        ctx.on('dispose',() => disposeRegistry?.());
    }

}

export abstract class EditorInstance{
    protected accessor: FileAccessor;
    protected target: BehaviorSubject<HTMLElement | null>;
    protected constructor(protected ctx:Context, protected config:{target:BehaviorSubject<HTMLElement | null>,accessor:FileAccessor}) {
        this.target = config.target;
        this.accessor = config.accessor;
        let targetSubscription : Subscription
        this.ctx.on('ready',async ()=>{
            await Promise.resolve();
            targetSubscription = this.target.subscribe((element)=>{
                console.info(element);
                if(element)
                    this.attach(element);
                else
                    this.detach();
            })
        })
    }
    abstract attach(element:HTMLElement):void;
    abstract detach():void;
}

export class EditorService extends Service{

    current : BehaviorSubject<EditorInstance|null>;

    constructor(ctx:Context) {
        super(ctx,'editor');
        this.current = new BehaviorSubject<EditorInstance | null>(null);
    }

    async start(){
        this.current.complete();
        this.current = new BehaviorSubject<EditorInstance | null>(null);
    }

    async stop(){
        this.current.complete();
    }

    editors: ReactiveMap<string,Editor<any>> = new ReactiveMap();

    register(name:string,editor: Editor<Context>) {
        this.editors.set(name,editor);
        return () => {
            this.editors.delete(name);
        };
    }

}

