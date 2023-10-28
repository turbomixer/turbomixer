import {EventEmitter} from 'eventemitter3'
import {Editor} from "./editor";


export interface Document{
    dependencies?: string[]
    content: any
}