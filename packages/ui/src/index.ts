import {Service, Context, Awaitable,Editor} from "@turbomixer/core";
import App from './App.vue'
import {createApp,App as VueApp} from "vue";

export interface UiConfigure{
    element:HTMLElement
}

declare module "@turbomixer/core"{
    interface Editor{
        attach?(container:HTMLElement):any;
        detach?():any;
    }
}



export class UiService extends Service{

    app:VueApp

    constructor(ctx:Context,protected config:UiConfigure) {
        super(ctx,'ui');
        this.app = createApp(App)
            .provide('ctx',this.ctx)
        ctx.on('editor.activate',(name,editor)=>{
            const container = this.getContainer();
            console.info("Activate",container,editor);
            if(editor.attach && container){
                editor.attach(container);
            }
        })
        ctx.on('editor.deactivate',(name,editor)=>{
            editor.detach?.();
            console.info("Deactivate");
        })
    }

    protected start(): Awaitable<void> {
        this.app.mount(this.config.element);
    }

    protected stop(): Awaitable<void> {
        this.app.unmount()
    }

    getContainer():HTMLElement|null{
        return (this.app._instance?.exposed?.['getContainer'] as ()=>HTMLElement)?.();
    }
}