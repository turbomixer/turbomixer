import {Awaitable, createTurbomixer, NavigationEntity} from "@turbomixer/core/src";
import {UiService} from "@turbomixer/ui/src";
import "@turbomixer/ui/lib/style.css";
import {Context} from "cordis";
import {TurboMixerOfficialClient} from "@turbomixer/client/src";
import {BlocklyEditor} from "../packages/blockly/src";

const turbomixer = createTurbomixer();

//@ts-ignore
window.turbomixer = turbomixer;

const plugin = turbomixer.plugin(TurboMixerOfficialClient,{server:"http://localhost:8788/turbomixer/api"});

turbomixer.plugin(UiService,{element:document.getElementById("app")});

console.warn(turbomixer.plugin(BlocklyEditor))