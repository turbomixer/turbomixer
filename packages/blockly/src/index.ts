import {Editor, Context, EditorInstance, FileAccessor, DisposableHelper, ApiDefinition} from "@turbomixer/core";
import {createBlockly} from "blockly-multiverse";
import type * as Blockly from 'blockly';
import type {BlockDefinition} from "blockly/core/blocks";
import {BehaviorSubject,Subject,debounceTime,map,filter} from 'rxjs'
import type {BlockInfo, FlyoutItemInfo, StaticCategoryInfo} from "blockly/core/utils/toolbox";
import {BlocklyDefaultToolBox} from "./toolbox";
import {injectZhHans} from "./msg/zh/official";
import {decode, encode} from "@msgpack/msgpack";

declare module '@turbomixer/core' {
    interface Editors {
        blockly: BlocklyEditor
    }
    interface Context{
        "editor:blockly":BlocklyEditor
    }
    interface Events{
        "blockly/category-changed"():void;
        "blockly/block-added"(block:BlockDefinition & {id:string}):void;
        "blockly/block-removed"(block:BlockDefinition & {id:string}):void;
    }
}

declare module "blockly"{
    interface BlockSvg{
        exportApi?():ApiDefinition;
    }
}

function insertArrayMap<K,V>(set:Map<K,V[]>,key:K,value:V){
    if(!set.has(key)){
        set.set(key,[value]);
    }else {
        let array = set.get(key) as V[];
        array.push(value)
        set.set(key,array);
    }
}

function mergeArray<T,K extends keyof T,R,O>(array:T[],key: K | ((value:T)=>R),merge:(value:T[])=>O):O[]{
    let map = new Map<T[K]|R,T[]>
    array.forEach(value => insertArrayMap(map,typeof key == 'function' ? key(value) : value[key],value));
    return Array.from(map.values()).map(merge);
}

function uniqueKey<T,K extends keyof T>(array:T[],key:K){
    let map = new Map<T[K],T>;
    array.forEach(v=>map.set(v[key],v));
    return Array.from(map.values())
}

export type HasOrderFlyoutItemInfo = FlyoutItemInfo & {order?:number}

export interface HasOrderStaticCategoryInfo extends StaticCategoryInfo{
    order?: number,
    contents: HasOrderToolboxItemInfo[]
}

export type HasOrderToolboxItemInfo = HasOrderFlyoutItemInfo | HasOrderStaticCategoryInfo;

function mergeCategoryInfo(categories:HasOrderStaticCategoryInfo[]):HasOrderStaticCategoryInfo[]{
    // For categories, merge it by name.
    return mergeArray(categories,'name',(value)=>{
        let dynamic_category = value.find(category => 'custom' in category);
        if(dynamic_category){
            return dynamic_category;
        }
        const unmerged_contents = value.map(content => content.contents ?? []).flat(1)
        return ({
            kind: 'category',
            name: value[0].name,
            colour: value.filter(value=>!!value.colour)[0]?.colour,
            contents:[
                ...mergeCategoryInfo(unmerged_contents.filter(item=>item.kind == 'category') as HasOrderStaticCategoryInfo[]),
                ...uniqueKey((unmerged_contents.filter(item=>item.kind == 'block') as (BlockInfo & {order:number})[]),'type'),
                ...(unmerged_contents.filter((data)=>data.kind != 'block' && data.kind != 'category') as HasOrderFlyoutItemInfo[])
            ].sort((a,b) => (a.kind == 'category' && b.kind != 'category') ? 1 : ((b.order?? 0) - (a.order??0))),
            order: value.reduce((previousValue, currentValue)=>currentValue.order && currentValue.order > previousValue ? currentValue.order : previousValue,Number.MIN_SAFE_INTEGER)
        }) as HasOrderStaticCategoryInfo
    });
}

export class BlocklyEditor extends Editor{

    static using = ['editor','file'];

    category:Set<HasOrderStaticCategoryInfo[]> = new Set<any>();
    blocks:Set<BlockDefinition & {id:string}> = new Set<any>();

    constructor(ctx:Context) {
        super(ctx,'blockly');
    }

    protected start(): void {
        this.ctx.file.registerExtension("blockly",BlocklyEditorInstance);
    }

    registerBlock(block:BlockDefinition & {id:string}){
        if(this.blocks.has(block))
            return ()=>null;
        this.blocks.add(block);
        this.ctx.emit("blockly/block-added",block);
        return DisposableHelper.makeDisposable(this[Context.current],()=>{
            this.blocks.delete(block);
            this.ctx.emit('blockly/block-removed',block);
        })
    }

    registerCategory(definition:StaticCategoryInfo[]):()=>void{
        if(this.category.has(definition))
            return ()=>null;
        this.category.add(definition);
        this.ctx.emit("blockly/category-changed");
        return DisposableHelper.makeDisposable(this[Context.current],()=>{
            this.category.delete(definition);
            this.ctx.emit("blockly/category-changed");
        });
    }
}


export class BlocklyEditorInstance extends EditorInstance{

    static EMPTY_SYMBOL = Symbol('Empty Document');

    reusable = true;


    blockly? : (typeof Blockly & {__skycover__:{dispose:()=>void}})

    document : BehaviorSubject<any> = new BehaviorSubject<any>(BlocklyEditorInstance.EMPTY_SYMBOL);

    saving? : Subject<any>;

    constructor(protected ctx:Context,protected config:{target:BehaviorSubject<any>,accessor:FileAccessor}) {
        super(ctx,config);
        ctx.on("blockly/category-changed",()=>{
            if(!this.workspace){
                return;
            }
            this.workspace.updateToolbox({
                kind: 'categoryToolbox',
                contents: [...BlocklyDefaultToolBox,...mergeCategoryInfo(Array.from(this.ctx['editor:blockly'].category).flat())]
            });
        })

        ctx.on("ready",()=>{
            ctx.on("blockly/block-added",(block)=>{
                // @todo: call the recheck process first to avoid breaking document
                if(!this.blockly)
                    return;
                this.blockly.Blocks[block.id] = block;
            })

            ctx.on("blockly/block-removed",(block)=>{
                // @todo: call the recheck process first to avoid breaking document
                if(!this.blockly)
                    return
                delete this.blockly.Blocks[block.id];
            })
        })

        let saveSubscription = this.document
            .pipe(debounceTime(3000))
            .subscribe(async (data)=>{
                await this.accessor.write(encode(data).slice());
            })

        this.ctx.on('dispose',async ()=>{
            saveSubscription.unsubscribe()
            await this.accessor.write(encode(this.document.getValue()).slice());
            this.document.complete();
        });

        ctx.on('dispose',()=>{

        })
    }

    element?:HTMLElement;

    workspace?:Blockly.WorkspaceSvg;

    async attach(element:HTMLElement){
        if(this.document.value == BlocklyEditorInstance.EMPTY_SYMBOL){
            let b_document;
            const buffer = await this.accessor.read()
            if(buffer.byteLength != 0){
                b_document = decode(buffer);
            }else b_document = {version:1,document:null,abi:[]}
            this.document.next(b_document);
        }

        this.saving = new Subject<any>();
        this.blockly = createBlockly();
        injectZhHans(this.blockly)
        this.ctx["editor:blockly"].blocks.forEach(block=>(this.blockly as typeof Blockly).Blocks[block.id] = block);
        this.element = document.createElement("div")
        this.element.style.height = '100%';
        this.element.style.zIndex = '0'
        element.appendChild(this.element);
        this.workspace = this.blockly.inject(this.element,{
            toolbox:{
                kind: 'categoryToolbox',
                contents: [...BlocklyDefaultToolBox,...mergeCategoryInfo(Array.from(this.ctx['editor:blockly'].category).flat())]
            },
            maxTrashcanContents:0
        })
        if(this.document.value?.document)
            this.blockly.serialization.workspaces.load(this.document.value?.document,this.workspace);
        this.workspace.addChangeListener((ev)=>{
            if(!this.blockly)
                return
            switch (ev.type){
                case this.blockly.Events.BLOCK_MOVE:
                    let event = ev as Blockly.Events.BlockMove
            }

            if (ev.type === 'create' || ev.type === 'move'  || ev.type === 'delete' || ev.type === 'change'){
                this.saving?.next({});
            }
        })

        this.saving.pipe(
            debounceTime(1000),
            map(()=>this.getDocument()),
            filter(t=>!!t)
        )
            .subscribe(async (save)=>{
                this.document.next(save);
            })
    }

    getDocument(){
        return this.workspace && this.blockly ? {document:this.blockly.serialization.workspaces.save(this.workspace),abi:
                this.workspace.getAllBlocks().filter((block)=>'exportAbi' in block).map(block=>block.exportApi?.()).filter(t=>!!t)
        } : null;
    }

    detach(){
        if(!this.element)
            return;
        let b_document = this.getDocument();
        if(b_document)
            this.document.next(b_document);
        this.disposeBlockly();
        this.saving?.complete();
        this.element.remove();
        this.element = undefined;
        this.workspace = undefined;
    }

    disposeBlockly(){
        this.workspace?.hideComponents();
        this.workspace?.hideChaff();
        this.workspace?.dispose();
        this.blockly?.__skycover__.dispose();
        this.blockly = undefined;
    }
}

export default BlocklyEditor;