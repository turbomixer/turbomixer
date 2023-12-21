import {Context} from '@turbomixer/server';
import  { resolve } from 'path'

export const inject = ['turbomixer_plugin']
export function apply(ctx:Context){
    ctx.turbomixer_plugin.editor({
        id:'editor-blockly',
        name:'积木编辑器',
        development: resolve(__dirname, '../client/index.ts'),
        production: resolve(__dirname, '../dist')
    });
}