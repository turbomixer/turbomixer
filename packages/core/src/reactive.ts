import { Context,Service } from 'cordis';
import {
    BehaviorSubject,
    Observable,
    Observer,
    Subject,
} from "rxjs";

declare module "."{
    interface Context{
        reactive:ReactiveService;
    }
}

export type ExtractBehavior<T extends Record<string, any>> = {
    [K in keyof T]: BehaviorSubject<T[K]>
}

export type ExtractSubject<T extends Record<string, any>> = {
    [K in keyof T]: Subject<T[K]>
}

export class ReactiveService extends Service{
    constructor(ctx:Context) {
        super(ctx,'reactive');
    }

    behavior<T>(value:T){
        const behavior = new BehaviorSubject(value);

        const dispose = this[Context.current].scope.collect('reactive/behavior',()=>{
            behavior.complete();
        });

        behavior.subscribe({
            complete:()=>dispose()
        })

        return behavior;
    }

    subject<T>():Subject<T>{
        const subject = new Subject<T>();

        const dispose = this[Context.current].scope.collect('reactive/subject',()=>{
            subject.complete();
        });

        subject.subscribe({
            complete:()=>dispose()
        })

        return subject;
    }

    subscribe<T>(
        external:Observable<T>,
        observerOrNext?: Partial<Observer<T>> | ((value: T) => void)
    ):ReturnType<Observable<T>['subscribe']>{

        const subscription = external.subscribe(observerOrNext);

        const dispose = this[Context.current].scope.collect('reactive/subscription',()=>{
            subscription.unsubscribe();
        })

        subscription.add(()=>dispose());

        return subscription as any;
    }

    behaviors<T extends Record<string, any>>(values:T):ExtractBehavior<T>{
        return Object.fromEntries(Object.entries(values).map(([key,value])=>[key,this.behavior(value)])) as any;
    }

    subjects<T extends Record<string, any>>(names:(keyof T)[]):ExtractSubject<T>{
        return Object.fromEntries(names.map((name)=>[name,this.subject()])) as any;
    }
}