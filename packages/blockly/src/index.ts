import {Document, Editor, CompileResult} from "@turbomixer/core";
import {createBlockly} from "blockly-multiverse";
import type {WorkspaceSvg} from 'blockly'
import {Context, Service} from "cordis";

declare module '@turbomixer/core' {
    interface Editors {
        blockly: BlocklyEditor
    }
}

export class BlocklyEditor implements Editor{

    static init(ctx:Context,name:string){
        ctx.using(['project'],()=>{
            ctx.project.extension_map.set('blockly',name);
        })
    }

    blockly = createBlockly();
    workspace:WorkspaceSvg | null = null
    document:Document | null = null

    toolbox_categories:Set<any> = new Set<any>()

    compile(options: any): CompileResult {
        if(!this.document)
            throw new Error('Cannot compile because no document loaded');
        const workspace = new this.blockly.Workspace();
        this.blockly.serialization.workspaces.load(this.document?.content,workspace);
        return {
            files:{}
        };
    }

    dispose(): void {
        this.blockly['__skycover__'].dispose();
    }

    load(document: Document): void {
        this.document = document;
        if(this.workspace)
            this._loadWorkspace();
    }

    save(): Document {
        if(!this.document)
            throw new Error('Cannot save because no document loaded');
        if(this.workspace)
            this._saveWorkspace();
        return this.document;
    }

    protected _saveWorkspace(){
        if(!this.document)
            throw new Error('No document loaded');
        if(!this.workspace)
            throw new Error('No workspace loaded');
        this.document.content = this.blockly.serialization.workspaces.save(this.workspace);
    }

    protected _loadWorkspace(){
        if(!this.document)
            throw new Error('No document loaded');
        if(!this.workspace)
            throw new Error('No workspace loaded');
        this.blockly.serialization.workspaces.load(this.document.content,this.workspace);
    }

    attach(element:HTMLElement){
        this.workspace = this.blockly.inject(element)
        if(this.document)
            this._loadWorkspace()
    }

    detach(){
        if(this.document)
            this._saveWorkspace();
        this.workspace?.dispose()
    }

    registerBlock(ctx:Context,name:string,def:any){
        this.blockly.Blocks[name] = def;

        let disposeListener : ()=>boolean;
        const dispose = ()=>{
            disposeListener?.();
            this.blockly.Blocks[name] = null;
        }
        disposeListener = ctx.once('dispose',()=>{
            dispose();
        })
        return dispose;
    }

    registerCategory(ctx:Context,category:any){
        this.toolbox_categories.add(category);
        let disposeListener : ()=>boolean;
        const dispose = ()=>{
            disposeListener?.();
            this.toolbox_categories.delete(category);
        }
        disposeListener = ctx.once('dispose',()=>{
            dispose();
        })
        return dispose;
    }
}