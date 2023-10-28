import {Document, Editor, ApiRegistry,Context} from "@turbomixer/core";
import {createBlockly} from "blockly-multiverse";
import type {WorkspaceSvg} from 'blockly'
import {BehaviorSubject,Subscription} from 'rxjs';

declare module '@turbomixer/core' {
    interface Editors {
        blockly: BlocklyEditor
    }
}

export class BlocklyEditor implements Editor{

    toolbox_categories:Set<any> = new Set<any>();

    blockly = createBlockly();
    workspace:WorkspaceSvg | null = null;

    document: BehaviorSubject<Document | null> = new BehaviorSubject<Document|null>(null);

    dependencies: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    document_subscriber : Subscription | null = null;

    constructor(ctx:Context,api_registry:ApiRegistry) {
        ctx.project.extension_map.set("blockly","blockly");
    }

    load(document:Document){
        this.document.next(document);
    }

    save(): Document {
        if(this.workspace == null)
            throw new Error('Workspace is null!');
        const document:Document = {
            content: this.blockly.serialization.workspaces.save(this.workspace),
            dependencies: this.dependencies.value
        }
        this.document.next(document);
        return document;
    }

    attach(container:HTMLElement){
        this.workspace = this.blockly.inject(container,{
            toolbox: {
                "kind": "categoryToolbox",
                "contents": Array.from(this.toolbox_categories.values())
            }
        });

        this.document_subscriber = this.document.subscribe((newDocument)=>{
            this.blockly.serialization.workspaces.load(newDocument?.content ?? {},this.workspace as WorkspaceSvg);
            this.dependencies.next(newDocument?.dependencies ?? [])
        })
    }

    detach(){
        this.document_subscriber?.unsubscribe();
        this.workspace?.dispose();
        this.blockly['__skycover__'].dispose();
    }

    clear() {
        this.document.next(null);
    }

    registerBlock(ctx:Context,name:string,def:any):()=>void{
        this.blockly.Blocks[name] = def;

        let disposeListener : ()=>void;
        const dispose = ()=>{
            disposeListener?.();
            this.blockly.Blocks[name] = null;
        }
        disposeListener = ctx.once('dispose',()=>{
            dispose();
        })
        return dispose;
    }

    unregisterBlock(id:string){
        this.blockly.Blocks[id] = null;
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
        this.workspace?.updateToolbox(this.getWorkspace());
        return dispose;
    }

    getWorkspace(){
        return {
            "kind": "categoryToolbox",
            "contents": Array.from(this.toolbox_categories.values())
        }
    }
}

export const _using = ['editor'];

export {_using as using};

export function apply(ctx:Context){
    ctx.editor.register('blockly',BlocklyEditor);
    let registrations:(()=>void)[] = [];
    console.info("Registering.....");
    let registration_handler = ctx.editor.using<BlocklyEditor>('blockly').subscribe((editor)=>{
        console.info("Registration triggered!")
        registrations.forEach((registration)=>registration());
        registrations = [];
        if(editor){
            console.info("Registration!")
            registrations.push(
                editor.registerBlock(ctx,'test',{
                    init: function() {
                        this.appendDummyInput()
                            .appendField("Hello World");
                        this.setPreviousStatement(true, null);
                        this.setNextStatement(true, null);
                        this.setColour(230);
                        this.setTooltip("");
                        this.setHelpUrl("");
                    }
                })
            );
            registrations.push(editor.registerCategory(ctx,{
                "kind": "category",
                "name": "Control",
                "contents": [
                    {
                        "kind": "block",
                        "type": "controls_if"
                    },
                ]
            }))
        }
    });
}