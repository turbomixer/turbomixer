import {BehaviorSubject, Observable} from "rxjs";

export type ApiDefinitionType = {type:'const'} | {type:'function',parameters:string[],return:boolean}

export class ApiHandler{
    public readonly source : BehaviorSubject<string>;

    public readonly name : BehaviorSubject<string>;

    public readonly type : BehaviorSubject<ApiDefinitionType>;

    constructor(
        protected id:string,
        source:string,
        name:string,
        type:ApiDefinitionType
    ) {
        this.source = new BehaviorSubject<string>(source);
        this.name = new BehaviorSubject<string>(name);
        this.type = new BehaviorSubject<ApiDefinitionType>(type);
    }

    save(){
        return {
            id: this.id,
            source: this.source.value,
            name: this.name.value,
            type: this.type.value
        }
    }

    static load(object:any){
        return new ApiHandler(object['id'],object['source'],object['name'],object['type'])
    }
}

export class ApiRegistry{

    registry:Map<string,BehaviorSubject<ApiHandler | null>> = new Map<string,BehaviorSubject<ApiHandler | null>>();

    register(
        id:string,
        source:string,
        name:string,
        type:ApiDefinitionType
    ):ApiHandler{
        this.allocate(id);
        const handler = new ApiHandler(id,source,name,type);
        (this.registry.get(id) as BehaviorSubject<ApiHandler>).next(handler);
        return handler;
    }

    allocate(id:string){
        if(!this.registry.has(id)){
            this.registry.set(id,new BehaviorSubject<ApiHandler | null>(null));
        }
    }

    using(id:string):BehaviorSubject<ApiHandler | null>{
        this.allocate(id);
        return (this.registry.get(id) as BehaviorSubject<ApiHandler | null>);
    }

    unregister(id:string){
        this.registry.get(id)?.next(null);
    }

    save(){
        return Array.from(this.registry.values())
            .map(item=>item.value)
            .filter(value => !!value)
            .map(handler => (handler as ApiHandler).save())
    }

    load(object:any[]){
        object.forEach((handler)=>{
            const id = handler['id'];
            this.allocate(id);
            (this.registry.get(id) as BehaviorSubject<ApiHandler>).next(ApiHandler.load(handler));
        })
    }
}