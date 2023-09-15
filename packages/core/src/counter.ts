export class Counter{

    protected callbacks : Map<number,((target:number)=>void)[]> = new Map();

    count : number = 0

    increase(incremental:number=1){
        this.count+=incremental;
        this.emit(this.count);
    }

    decrease(decremental:number=1){
        this.count-=decremental;
        this.emit(this.count);
    }

    on(target:number,callback:(target:number)=>void){
        let callbacks = this.callbacks.get(target);
        if(!callbacks)
            callbacks = [];
        callbacks.push(callback);
        this.callbacks.set(target,callbacks);
    }

    off(target:number,callback:(target:number)=>void){
        let callbacks = this.callbacks.get(target)?.filter(cb=>callback!==cb);
        if(!callbacks)
            return;
        if(callbacks.length<=0)
            this.callbacks.delete(target);
        this.callbacks.set(target,callbacks);
    }

    protected emit(number:number){
        this.callbacks.get(number)?.forEach(t=>t(number));
    }
}