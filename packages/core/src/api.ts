import {Awaitable} from "./utils";
import {EventEmitter} from "eventemitter3";
import {Service} from "./app";
import {Context} from "cordis";

export interface ApiDefinition {
    identifier:string
    type:string,
    signatures:Record<string, ApiDefinitionType> | ApiDefinitionType
}

export interface ApiType{
    name:string,
    callback:()=>void
}

export type ApiDefinitionType = {type:'const'} | {type:'function',parameters:string[],return:boolean}

export class ApiTypeRegistry{
    registry : Map<string,ApiType> = new Map();

    register(type:ApiType){
        this.registry.set(type.name,type);
    }

    get(name:string){
        return this.registry.get(name);
    }
}

export namespace ReactiveApi{
    export interface ApiPublishHandler{
        dispose:()=>void
    }

    export interface ApiOrderHandler{
        dispose:()=>void;
    }
}

export class ReactiveApiRegistry{

    registry:Map<string, ApiDefinition> = new Map();

    emitter:EventEmitter = new EventEmitter()

    publish(api:ApiDefinition):ReactiveApi.ApiPublishHandler | false{
        if(this.registry.has(api.identifier)){
            return false;
        }
        this.registry.set(api.identifier,api);
        this.emitter.emit('dependency');
        const that = this;
        return {
            dispose(){
                if(that.registry.has(api.identifier)){
                    that.registry.delete(api.identifier);
                    that.emitter.emit('dependency');
                }
            }
        }
    }

     using(apis:ApiDefinition[],execute:()=>Awaitable<()=>void>,updated?:(status:Record<string, boolean>)=>void):ReactiveApi.ApiOrderHandler{
        let enabled = false;

        let executeDispose : null | (()=>void) = null;

        let updateCallback = async()=>{
            //@todo:Optimize algorithm
            const registryDef = Array.from(this.registry.values())
            const dependencies = apis.map(def=>[def.identifier,registryDef.some(reg=>reg.identifier == def.identifier)])
            if(dependencies.every(item=>item[1])){
                if(!enabled)
                    executeDispose = await execute();
                enabled = true;
            }else{
                if(enabled)
                    executeDispose?.();
                enabled = false;
            }
            updated?.(Object.fromEntries(dependencies));
        }

        setTimeout(updateCallback,0);

        this.emitter.on('dependency',updateCallback);

        const that = this;

        return {
            dispose(){
                that.emitter.off('dependency',updateCallback);
                if(enabled)
                    executeDispose?.();
            }
        }
    }

    list(){
        return Array.from(this.registry.values())
    }
}

export class ApiService extends Service{
    constructor(ctx:Context) {
        super(ctx,'api');
    }

    registry = new ReactiveApiRegistry();

    types = new ApiTypeRegistry();
}