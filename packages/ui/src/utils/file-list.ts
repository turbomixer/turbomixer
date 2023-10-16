import {Project, ProjectDirectory, ProjectFile} from "@turbomixer/core";

export function generateTreeNodeList(file?:Record<string, ProjectFile | ProjectDirectory> | undefined,path:string = ''):any{
    if(!file)return [];
    return Object.entries(file).map(([name,entity])=>{
        if(entity.type == 'directory'){
            return {
                id:path + "/" + name,
                name,
                children:generateTreeNodeList(entity.children,path + "/" + name)
            }
        }else{
            return {
                id:path + "/" + name,
                name
            }
        }
    }).map(entity=>[((entity.children ? 256 : 0) + entity.name.charCodeAt(0)),entity])
        .sort(([index1,entity],[index2,entity2])=>((index2 as number) - (index1 as number)))
        .map(t=>t[1])
}