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

    static using = ['project'];

    app:VueApp

    constructor(ctx:Context,protected config:UiConfigure) {
        super(ctx,'ui');
        this.app = createApp(App)
            .provide('ctx',this.ctx)
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