import {EventEmitter} from "eventemitter3";

export type ReactiveMapEntityListener<K,V> = (key:K,value:V)=>void;

export class ReactiveMap<K extends Object,V> extends Map<K,V>{

    emitter: EventEmitter = new EventEmitter<string | symbol, any>()

    constructor() {
        super();
    }

    set(key: K, value: V): this {
        // Announce change
        this.emitter.emit('change',key,value,this.get(key));
        this.emitter.emit('change:'+key.toString(),value,this.get(key))
        super.set(key,value);
        return this;
    }
}