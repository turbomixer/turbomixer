import {Context} from "cordis";

export namespace DisposableHelper{
    export function makeDisposable(ctx:Context,revert:()=>void){
        let disposed = false;
        const disposeEvent = ctx.on('dispose',()=>{
            if(disposed)
                return
            revert();
            disposeEvent();
            disposed = true;
        })
        return revert;
    }
}