import {Document} from "./document";
import {Service} from "./app";
import {Context} from "cordis";

export interface Compiler{
    compile(document:Document,files:Record<string, Document>):Record<string, any>;
}

export type CompilerConstructor = {
    new():Compiler,
    type:string, // e.g. blockly
    target:{
        language:string, // javascript
        platform:string  // any_platform / koishi / ....
    }
}

export class CompilerManager extends Service{
    constructor(ctx:Context) {
        super(ctx,'compiler');
    }
}