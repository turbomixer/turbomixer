import {Service} from "./app";
import {Context} from "cordis";
import {Field} from "@minatojs/core";
import string = Field.string;

declare module '.'{
    interface Context{
        turbomixer_plugin: ServerPluginManager
    }
}

export type EditorPluginEntry = {
    id: string
    name: string
    using?: string[]
    production: string
    development?: string
    automation?: string[]
}

export class ServerPluginManager extends Service
{
    protected editor_plugins:Map<string,EditorPluginEntry> = new Map;

    constructor(ctx:Context) {
        super(ctx,'turbomixer_plugin');
    }

    editor(entry:EditorPluginEntry){
        this.editor_plugins.set(entry.id,entry);
        this[Context.current].on('dispose',()=>{
            this.editor_plugins.delete(entry.id);
        })
    }

    runtime(){
        
    }

    get_editor_plugins():Map<string,EditorPluginEntry>{
        return this.editor_plugins;
    }
}