import {Context} from "cordis";
import {BehaviorSubject} from "rxjs";

export namespace Reactive{

    export type ExtractBehavior<T extends readonly any[]> = {
        [K in keyof T]?:BehaviorSubject<T[K]>
    }


    export function createBehaviorSubject<T>(value:T,ctx:Context):BehaviorSubject<T>{
        const subject = new BehaviorSubject(value);
        ctx.on('dispose',()=>{
            subject.complete()
        })
        return subject
    }

    export function behavior<T>(ctx:Context,initialValue:T,callback:(subject:BehaviorSubject<T>)=>void){
        ctx.on('ready',()=>{

        })
    }

    export type BehaviorTransformer<T> = (input:T)=>BehaviorSubject<T>

    export function behaviors<T extends readonly any[],P>(ctx:Context,initialValues:T,callback:(subjects:ExtractBehavior<T>)=>void){
        let subjects:ExtractBehavior<T> | null = null;
        ctx.on('ready',()=>{
            subjects?.forEach((value)=>value?.complete());
            subjects = initialValues.map(function<P>(value:P){return new BehaviorSubject(value)}) as ExtractBehavior<T>;
            callback(subjects);
        })

        ctx.on('dispose',()=>{
            subjects?.forEach((value)=>value?.complete());
            callback(initialValues.map(()=>undefined) as ExtractBehavior<T>);
        })
    }
}

