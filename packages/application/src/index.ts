import {createTurbomixer} from "@turbomixer/core";
import {UiService} from "@turbomixer/ui";
import {TurboMixerOfficialClient} from "@turbomixer/client";
import "@turbomixer/ui/lib/style.css";

declare global{
    interface Window{
        config? : {
            server ? : string
        }
    }
}



const turbomixer = createTurbomixer();

turbomixer.plugin(UiService,{element:document.getElementById("app")});

const plugin = turbomixer.plugin(TurboMixerOfficialClient,{server: window.config?.server ?? '/api'});