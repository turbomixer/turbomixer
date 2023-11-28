import {BehaviorSubject} from "rxjs";

export class ReactiveMap<K,V> extends Map<K,V>{

    listeners: Map<K,BehaviorSubject<V|undefined>> = new Map;
    counter: Map<K,number> = new Map;

    protected delta(key:K,delta:number):number{
        if(!this.counter.has(key)){
            if(delta <= 0)
                return 0;
            this.counter.set(key,delta);
            return delta;
        }
        let value = Math.max(0,this.counter.get(key) as number + delta);
        if(value>0){
            this.counter.set(key,value);
            return value;
        }
        this.counter.delete(key)
        return 0;
    }

    listen(key:K){
        this.delta(key,1);
        let behavior:BehaviorSubject<V|undefined>;
        if(this.listeners.has(key))
            behavior = this.listeners.get(key) as BehaviorSubject<V|undefined>;
        else{
            behavior = new BehaviorSubject<V|undefined>(this.get(key));
            this.listeners.set(key,behavior);
        }
        let disposed = false;
        return {
            behavior:behavior,
            dispose:()=>{
                if(disposed)
                    return;
                disposed = true;
                let counter = this.delta(key,-1);
                console.info("Reactive Map Disposed:" + counter);
                if(counter <= 0){
                    behavior.complete();
                    this.listeners.delete(key);
                }
            }
        }
    }

    set(key: K, value: V): this {
        super.set(key,value);
        this.listeners.get(key)?.next(value);
        return this;
    }

    delete(key: K): boolean {
        this.listeners.get(key)?.next(undefined);
        return super.delete(key);
    }
}