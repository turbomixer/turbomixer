import {createTurbomixer} from '@turbomixer/core'
import {createBlockly} from "blockly-multiverse";
import * as BlocklyEditor from "@turbomixer/editor-blockly";
import {UiService} from "@turbomixer/ui";
import '@turbomixer/ui/lib/style.css'
import {BehaviorSubject} from "rxjs";
import {AbstractFilesystemAPI, DirectoryAccessor, FileEntity,Project} from "@turbomixer/core";
import * as Client from "@turbomixer/client";

const turbo = createTurbomixer()

turbo.plugin(BlocklyEditor);

turbo.plugin(UiService,{
    element:document.getElementById('app')
});

const demoApi : Partial<AbstractFilesystemAPI> = {
    async watch(entityKey: string, listener: (entity: FileEntity, type: ("add" | "remove" | "rename"), newValue?: FileEntity) => void): Promise<() => Promise<void>> {
        console.info('watch',entityKey,listener);
        return ()=>Promise.resolve()
    },
    async list(){
        console.info("list");
        return [
            {type:'directory','name':"Demo3"},
            {type:'file','name':"Demo4.blockly"}
        ]
    },
    async open(path:string){
        return 'file:'+path;
    },
    async close(handler:string){
        console.info("close",handler);
    },
    async read(handler:string){
        console.info("read",handler);
        return new ArrayBuffer(1);
    }
}

turbo.plugin(Client,{
    name:'Test',
    server:'http://localhost:8788/turbomixer/api',
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
