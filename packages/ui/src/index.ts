import {Service, Context, Awaitable} from "@turbomixer/core";
import App from './App.vue'
import {createApp,App as VueApp} from "vue";

export interface UiConfigure{
    element:HTMLElement
}

export class UiService extends Service{

    app:VueApp

    constructor(ctx:Context,protected config:UiConfigure) {
        console.info("Constructor")
        super(ctx,'ui');
        this.app = createApp(App)
            .provide('ctx',this.ctx)
    }

    protected start(): Awaitable<void> {
        console.info("Start")
        this.app.mount(this.config.element);
    }

    protected stop(): Awaitable<void> {
        this.app.unmount()
    }

}