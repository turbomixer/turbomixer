import {Attachable, Context, Editor, EditorInstance, Service} from ".";
import {ForkScope, Plugin} from "cordis";
import {NavigationEntity} from "./navigation";
import {
    BehaviorSubject,
    combineLatest, distinctUntilChanged,
    firstValueFrom,
    tap,
    map,
    mergeMap,
    Observable,
    pairwise,
    startWith, Subscription
} from "rxjs";
import {Awaitable} from "./infrastructure";
import {nanoid} from 'nanoid'
import {ReactiveMap} from "./infrastructure/reactive";


export interface FileAccessor {
    name:Observable<string>
    read():Awaitable<ArrayBuffer>;
    write(data:ArrayBuffer):Awaitable<boolean>;
    watch(callback:()=>void):Awaitable<()=>void>;
    close():void;
    open?():Awaitable<void>
    path:Observable<string>
}

export interface ProjectDirectoryChildren{
    name: string
    type: 'directory' | 'file'
}


export abstract class DirectoryAccessor {

    static EmptyObserver = new BehaviorSubject<null>(null);

    readonly hasChildren = true

    public name: BehaviorSubject<string>;

    public parent: BehaviorSubject<DirectoryAccessor | null>;

    public path: Observable<string>;

    protected constructor(protected ctx:Context,name:string,parent?:DirectoryAccessor) {
        this.name = new BehaviorSubject<string>(name);
        this.parent = new BehaviorSubject<DirectoryAccessor | null>(parent ?? null);
        this.path = combineLatest({
            name:this.name,
            parent:this.parent
                .pipe(
                    mergeMap(value => value?.parent ?? DirectoryAccessor.EmptyObserver),
                    mergeMap(value => value?.path ?? DirectoryAccessor.EmptyObserver)
                )
        }).pipe(map(({name,parent})=>{
            if(!parent){
                return '/'+name;
            }
            if(name.startsWith("/")){
                return name;
            }
            if(parent.endsWith("/"))
                return parent + name;
            return parent + "/" + name;
        }))
    }

    abstract file(name:string):FileAccessor;

    abstract directory(name:string):DirectoryAccessor;

    abstract list():Awaitable<ProjectDirectoryChildren[]>;

    abstract watch():Awaitable<BehaviorSubject<ProjectDirectoryChildren[]>>;

}

declare module "."{
    interface Context{
        file: FileService
    }
}

export class FileService extends Service {
    constructor(ctx: Context) {
        super(ctx, 'file');
    }

    files: Set<FileResourceAccessor> = new Set<FileResourceAccessor>();

    plugins: ReactiveMap<string,Plugin> = new ReactiveMap();

    protected start(): Awaitable<void> {

    }

    protected stop(): Awaitable<void> {
    }

    register(accessor:FileResourceAccessor){
        this.files.add(accessor);
    }

    unregister(accessor:FileResourceAccessor){
        this.files.delete(accessor);
    }

    async open(accessor:FileAccessor){
        const path = await firstValueFrom(accessor.path)
        console.info(path);
        if(this.ctx.navigation.entities.hasKey('file://'+path)){
            this.ctx.navigation.select('file://'+path);
        }else{
            this.ctx.plugin<FileAccessor>(FileEditorNavigationEntity,accessor);
        }
    }

    registerExtension(extension_name:string,plugin:Plugin){
        this.plugins.set(extension_name,plugin);
        this[Context.current].on('dispose',()=>{
            this.plugins.delete(extension_name);
        })
    }
}


export class FileEditorNavigationEntity extends NavigationEntity{
    protected pathSubscriber?: Subscription;
    protected titleSubscription?: Subscription;
    protected pluginSubscriber?: Subscription;
    protected constructor(ctx:Context, protected accessor:FileAccessor) {
        super(ctx);
    }
    async start(): Promise<void> {
        const extension = (await firstValueFrom(this.accessor.path)).split(".").pop()
        if(!extension)
            return;
        const {behavior:plugin,dispose} = this.ctx.file.plugins.listen(extension);
        let oldPlugin : ForkScope | null = null;
        this.ctx.on('dispose',()=>{
            dispose()
            oldPlugin?.dispose();
        });
        this.pluginSubscriber = plugin.subscribe((newPlugin)=>{
            if(oldPlugin){
                oldPlugin.dispose();
                oldPlugin = null;
            }
            if(newPlugin){
                oldPlugin = this.ctx.plugin(newPlugin,{
                    target:this.target,
                    accessor:this.accessor
                })
            }
        })

        this.ctx.navigation.add(nanoid(8),this);
        this.pathSubscriber = this.accessor.path.pipe(startWith(undefined),pairwise()).subscribe(([oldPath,newPath])=>{
            if(oldPath){
                this.ctx.navigation.entities.removeKey('file://'+oldPath);
            }
            if(newPath){
                this.ctx.navigation.entities.addKey('file://'+newPath,this);
                this.title.next(newPath.split('/').pop() ?? 'Unknown File');
            }
        })
    }

    async stop(): Promise<void> {
        this.ctx.navigation.entities.removeKey(await firstValueFrom(this.accessor.path));
        this.pathSubscriber?.unsubscribe();
        this.pluginSubscriber?.unsubscribe();
    }

}

export interface FileResourceAccessor{
    name: string
    root: DirectoryAccessor
}