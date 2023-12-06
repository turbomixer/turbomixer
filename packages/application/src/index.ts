import {createTurbomixer} from "@turbomixer/core";
import {UiService} from "@turbomixer/ui";
import {TurboMixerOfficialClient} from "@turbomixer/client";
import "@turbomixer/ui/lib/style.css";
import {TurboMixerModuleLoader} from "@turbomixer/loader";

declare global{
    interface Window{
        config? : {
            server ? : string
        },
        turbomixer:any
    }
}



const turbomixer = createTurbomixer();

window.turbomixer = turbomixer

turbomixer.plugin(UiService,{element:document.getElementById("app")});

const plugin = turbomixer.plugin(TurboMixerOfficialClient,{server: window.config?.server ?? '/api'});

turbomixer.plugin(TurboMixerModuleLoader)