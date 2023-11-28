import {LinkedMap, LinkedMapValue ,Awaitable} from "./infrastructure";
import {Service,Context} from ".";
import {BehaviorSubject, distinctUntilChanged, Observable, pairwise, Subscription} from "rxjs";

declare module "."{
    interface Context{
        navigation:NavigationService
    }
    interface Events{
        'navigation/entity-changed'():void;
    }
}

export interface Attachable{
    attach(element:HTMLElement):void;
    detach():void;
    close():Awaitable<void>;
}

export enum NavigationStatus{
    PRESERVED_0 = 1<<0,
    UNSAVED = 1<<1,
    ERROR = 1<<2
}

export abstract class NavigationEntity<C extends Context = Context,T=any>{

    static reusable = true;

    protected ctx : C;

    protected target : BehaviorSubject<HTMLElement | null> = new BehaviorSubject<HTMLElement | null>(null);

    protected targetSubscription : Subscription | null = null;

    protected title : BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    protected status : BehaviorSubject<number> = new BehaviorSubject<number>(0);

    protected constructor(ctx:C,name?:string ) {
        this.ctx = ctx;

        ctx.on('ready', async () => {
            await Promise.resolve()
            if(name)
                ctx.navigation.add(name,this);
            return this.start()
        })

        ctx.on('dispose', () => this.stop())
    }

    abstract start():Awaitable<void>;

    abstract stop():Awaitable<void>;

    async dispose(){
        await this.stop()
        this.target.complete();
        this.title.complete();
        this.ctx.scope.dispose()
    }


    attach(target:Observable<HTMLElement | null>){
        this.targetSubscription = target.subscribe((value)=>{
            this.target.next(value);
        });
    }

    detach(){
        this.targetSubscription?.unsubscribe();
        this.targetSubscription = null;
        this.target.next(null);
    }

    getTitle():BehaviorSubject<string|null>{
        return this.title;
    }

    getStatus():BehaviorSubject<number>{
        return this.status;
    }
}

export class NavigationService extends Service{

    entities : LinkedMap<NavigationEntity, string> = new LinkedMap<NavigationEntity, string>();

    current: BehaviorSubject<LinkedMapValue<NavigationEntity, string> | null> = new BehaviorSubject<LinkedMapValue<NavigationEntity, string> | null>(null);

    target: BehaviorSubject<HTMLElement | null> = new BehaviorSubject<HTMLElement | null>(null);

    attachSubscription?: Subscription;

    constructor(ctx:Context) {
        super(ctx,'navigation');
        this.current
            .pipe(
                distinctUntilChanged((previous, current)=> previous == current),
                pairwise()
            )
            .subscribe(([previousValue,currentValue])=>{
                if(previousValue?.value){
                    previousValue.value.detach();
                }
                if(currentValue?.value){
                    currentValue.value.attach(this.target);
                }
            })
    }

    protected start(): Awaitable<void> {
        if(!this.current.value && this.entities.hasItem())
            this.current.next(this.entities.head);
    }

    protected stop(): Awaitable<void> {
        this.current.next(null);
    }

    add(key:string,entity:NavigationEntity){
        const value = this.entities.append(entity);
        this.entities.addKey(key,entity);
        this.current.next(value);
        this.ctx.emit("navigation/entity-changed");
    }

    async remove(entity:NavigationEntity){
        if(this.current.value?.value == entity){
            this.current.next(this.current.value.next ?? this.current.value.previous);
        }
        this.entities.remove(entity);
        await entity.dispose()
        this.ctx.emit("navigation/entity-changed");
    }

    select(key:string){
        this.current.next(this.entities.getItemByKey(key) ?? null);
    }

    attach(element:HTMLElement){
        this.target.next(element);
    }

    detach(){
        this.target.next(null);
    }
}