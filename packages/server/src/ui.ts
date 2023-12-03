import {Context} from ".";
import * as fs from "fs";
import {join} from 'path';

export namespace TurboMixerUiService{
    export const inject = ['turbomixer_server'];
    export function apply(ctx:Context){
        ctx.turbomixer_server.register('/',['get'],async(ctx)=>{
            let path = require.resolve('@turbomixer/application')
            ctx.set('Content-Type','text/html')
            ctx.body = await fs.promises.readFile(path);
        });
        ctx.turbomixer_server.register('/assets/(.*)',['get'],async(ctx)=>{
            let path = require.resolve('@turbomixer/application/lib/assets/'+ctx.params[0])
            ctx.set('Content-Type',ctx.params[0].endsWith('css')?'text/css':'text/javascript')
            ctx.body = await fs.promises.readFile(join(path));
        });
    }
}