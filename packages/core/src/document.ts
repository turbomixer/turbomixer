import {EventEmitter} from 'eventemitter3'
import {Editor} from "./editor";
import {ApiDefinition} from "./api";


export interface Document{
    type?:string
    dependencies?:ApiDefinition[]
    exports?:ApiDefinition
    content?:any
}