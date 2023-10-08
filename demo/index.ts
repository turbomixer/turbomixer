import {createTurbomixer} from '@turbomixer/core'
import {createBlockly} from "blockly-multiverse";
import {BlocklyEditor} from "../packages/blockly/src";
import {UiService} from "@turbomixer/ui";

const turbo = createTurbomixer()
turbo.using(['editor'],(ctx)=>{
    ctx.editor.register('blockly',BlocklyEditor);
    ctx.editor.activate('blockly');
})

turbo.plugin(UiService,{
    element:document.body
});

/*
Benchmark & Memory Leak Test
window['benchmark'] = (async ()=>{
    console.info("OK");
    for(let i=0;i<1;i++){
        //console.info(i);
        let newBlockly = createBlockly();
        const div = document.createElement('div')
        div.style.height="500px";
        document.body.append(div);

        const workspace = newBlockly.inject(div,{media:'file:///none/'});
        //console.info("dispose");

        workspace.dispose();
        newBlockly['__skycover__'].dispose();
        document.body.removeChild(div);
    }
    return null;
})*/
window['create'] = createBlockly;
window['turbo'] = turbo;
