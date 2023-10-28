import {BehaviorSubject,combineLatest,map} from 'rxjs'
import {Context, Document, FileReference} from "@turbomixer/core";
import {decode} from "@msgpack/msgpack"
import {nanoid} from "nanoid";

class TabbarItem<T = any>{
    title: BehaviorSubject<string>
    modified: BehaviorSubject<boolean>
    content: BehaviorSubject<T>

    enabled:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(protected tabbar:EditorTabbarManager,public id:string,title:string,content:T) {
        this.title = new BehaviorSubject<string>(title);
        this.modified = new BehaviorSubject<boolean>(false);
        this.content = new BehaviorSubject<T>(content);
    }
}

export class EditorTabbarItem extends TabbarItem<Document>{
    file: BehaviorSubject<string>;

    editor: BehaviorSubject<string>

    constructor(protected tabbar:EditorTabbarManager,public id:string,title:string,file:string,editor:string,content:any) {
        super(tabbar,id,title,content);
        this.file = new BehaviorSubject<string>(file);
        this.editor = new BehaviorSubject<string>(editor);
    }
}

export class EditorTabbarManager{

    constructor(protected ctx:Context) {
    }

    current: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    tabs: BehaviorSubject<TabbarItem[]> = new BehaviorSubject<TabbarItem[]>([]);

    currentTab   = combineLatest({current:this.current,tabs:this.tabs})
        .pipe(map(({current,tabs})=>tabs?.find(tab=>tab.id == current)));

    open(item:TabbarItem){
        this.tabs.next([...(this.tabs.value??[]),item]);
        this.current.next(item.id);
    }

    select(id:string){
        this.current.next(id);
    }

    close(id:string){
        if(this.current.value == id){
            this.current.next(null);
        }
        this.tabs.next(this.tabs.value?.filter?.((s)=>s.id != id) ?? []);
    }

    async file(reference:FileReference){

        const file_name = reference.path();

        const already_existed_tab = this.tabs.value.find(object=>(object instanceof EditorTabbarItem) && object.file.value == file_name);
        console.info(this.tabs);
        if(already_existed_tab){
            this.select(already_existed_tab.id);
            return true;
        }

        const extension = file_name.substring(file_name.lastIndexOf('.')+1);
        const editor_name = this.ctx?.project.extension_map.get(extension)
        if(!editor_name){
            alert('找不到用于打开"'+ extension +'"的编辑器:无法识别的扩展名(可能是该类型的编辑器尚未安装)');
            return false;
        }

        if(!reference.isOpen()){
            await reference.open();
        }

        let document:Document;

        const data = await reference.read();

        if(data && data.byteLength > 3){
            const header = new Uint8Array(data.slice(0,3));
            if(new TextDecoder().decode(header) !== 'TMF'){
                alert("读取文件出错: 非法文件");
                return;
            }
            document = decode(data.slice(3)) as Document;
        }else{
            document = {
                content:null
            }
        }
        this.open(new EditorTabbarItem(this,nanoid(),file_name.split('/').pop() ?? 'Untitled',file_name,editor_name,document));
    }
}