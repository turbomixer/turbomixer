import {Service,Context} from "@turbomixer/core";
import * as Core from '@turbomixer/core';
import {CommonJS} from "./commonjs";
import {createRequire} from "./require";
import { defineProperty } from 'cosmokit'

export interface TurboMixerPluginConfig{
    name:string,
    code:string,
    using:string[]
}

export class TurboMixerModule{

    protected [Context.current]!: Context

    static reusable = true

    static inject = ['module']

    protected name:string

    constructor(protected ctx:Context,plugin:TurboMixerPluginConfig) {

        let service_name = this.name =  'module:'+plugin.name;

        ctx.provide(service_name);

        let module_constructor : (exports:any, require:any, module:any, __filename?:string, __dirname?:string)=>void
        try{
            module_constructor = eval(CommonJS.wrap(plugin.code));
        }catch (e) {
            console.error('Failed to parse plugin: '+plugin.name,e);
            throw e;
        }

        ctx.on('ready',async ()=>{
            await Promise.resolve()
            try{
                let virtual_require = createRequire(ctx);
                let virtual_module = {exports:{},require:virtual_require};
                module_constructor(virtual_module.exports,virtual_require,virtual_module);
                (ctx as any)[service_name] = virtual_module.exports;
                this.ctx.module.modules.set(plugin.name,virtual_module.exports);
            }catch (e){
                console.error('Failed to run plugin:'+plugin.name,e);
                throw e;
            }
        })

        ctx.on('dispose',async ()=>{
            this.ctx.module.modules.delete(plugin.name);
        })

        return Context.associate(Context.associate(this, 'service'), service_name)
    }

    [Context.filter](ctx: Context) {
        return ctx[Context.shadow][this.name] === this.ctx[Context.shadow][this.name]
    }
}

declare module "@turbomixer/core"{
    interface Context{
        module:TurboMixerModuleLoader
    }
}

export class TurboMixerModuleLoader extends Service{

    modules:Map<string,any> = new Map;

    constructor(ctx:Context) {
        super(ctx,'module');
        this.expose('@turbomixer/core',Core);
    }

    load(name:string,code:string,using:string[] = []){
        return this[Context.current].inject(using.map(module=>'module:'+module),(ctx)=>{
            ctx.plugin(TurboMixerModule,{
                name,
                code,
                using
            })
        })
    }

    expose(name:string,module:any){
        this.modules.set(name,module);
        this[Context.current].on('dispose',()=>{
            this.modules.delete(name);
        })
        this[Context.current].provide('module:'+name,module);
    }

    get(name:string):any{
        return this.modules.get(name);
    }
}