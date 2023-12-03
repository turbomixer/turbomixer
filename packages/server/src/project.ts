import {Context} from './app'
import {Service} from 'cordis'
import { promises as fs } from 'fs'
import * as path from "path";
import {ProjectDescriptor} from "@turbomixer/core";
import {NotFound} from "http-errors";
import {Context as KoaContext} from 'koa';
declare module "."{
    interface Context{
        project: ServerProjectManager
        baseDir: string
    }
}

export interface ServerProjectManagerConfig{
    root: string
}

export class ServerProjectManager extends Service{
    constructor(ctx:Context,protected config:ServerProjectManagerConfig) {
        super(ctx,'project');
    }

    async list(){
        const dir = await fs.opendir(path.join(this.ctx.baseDir,this.config.root));
        let projects : ProjectDescriptor[] = []
        for await(const file of dir){
            if(!file.isDirectory())
                return;
            const realPath = file.path;
            const configFile = path.join(realPath,'.turbomixer.config.json')
            try{
                let config = JSON.parse(await fs.readFile(configFile,{encoding:'utf-8'}))
                projects.push({
                    id: file.name,
                    name: config['name']
                })
            }catch (e) {

            }
        }
        return projects
    }

    async path(project:string){
        try{
            let project_path = path.join(this.ctx.baseDir,this.config.root);
            await fs.access(project_path);
            return project_path;
        }catch (e) {
            return false;
        }
    }

    async get(ctx:KoaContext,project:string,project_path:string,type:string){
        let project_children_path = path.join(this.ctx.baseDir,this.config.root,project,project_path);
        console.info("Access",project_children_path)
        try {
            await fs.access(project_children_path)
        }catch (e){
            ctx.body = {'error':'File or Directory Not Found'};
            ctx.status = 404;
            return;
        }
        let file_info = await fs.stat(project_children_path);
        if(type == 'directory' && file_info.isDirectory()){
            //ctx.res.setHeader('Content-Type','application/directory+json');
            ctx.body = await this.listDirectory(project_children_path);
            return;
        }
        if(type == 'file' && file_info.isFile()){
            //ctx.res.setHeader('Content-Type','application/octet-stream');
            ctx.body = await this.readFile(project_children_path);
            return;
        }
        ctx.body = {error:''};
        ctx.status = 406;
    }

    async listDirectory(project_path:string){
        console.info("List",project_path)
        console.info((await fs.readdir(project_path,{withFileTypes:true})).map(file=>({
            name:file.name,
            type:file.isDirectory() ? 'directory' : 'file'
        })))
        return (await fs.readdir(project_path,{withFileTypes:true})).map(file=>({
            name:file.name,
            type:file.isDirectory() ? 'directory' : 'file'
        }))
    }

    async readFile(project_path:string){
        return await fs.readFile(project_path);
    }
}