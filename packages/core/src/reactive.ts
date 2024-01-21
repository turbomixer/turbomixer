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
}