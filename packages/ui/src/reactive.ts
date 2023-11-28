import {Observable,OperatorFunction} from "rxjs";
export function cache<T extends Record<K, E>,E,R,K extends string|symbol|number>(key:K | ((value:T)=>E),project: (value: T) => R): OperatorFunction<T[], R[]> {
    const getKeyFor : (value:T) => E = typeof key == "function" ? key : (value:T)=>value[key];
    const generateAndCache = (value: T, key: E, cache: Map<E, R>) => {
        const data = project(value);
        cache.set(key, data);
        return data;
    }
    return (source) => {
        return new Observable((destination) => {
            let cachedObjects = new Map<E, R>;
            let subscribe = source.subscribe({
                complete: () => {
                    destination.complete();
                },
                next: (values) => {
                    for (const cachedKey of cachedObjects.keys()) {
                        if (values.findIndex(object => getKeyFor(object) == cachedKey) == -1) {
                            cachedObjects.delete(cachedKey);
                        }
                    }
                    destination.next(
                        values.map(
                            (value) => (cachedObjects.has(getKeyFor(value))
                                ? (cachedObjects.get(getKeyFor(value)) as R)
                                : generateAndCache(value, getKeyFor(value), cachedObjects)))
                    );
                },
                error(e) {
                    destination.error(e);
                }
            });
            return () => {
                subscribe.unsubscribe();
                cachedObjects.clear();
            };
        });
    }
}

export function extractMap<T>():OperatorFunction<Observable<T>[], T[]>{
    return (source)=>{
        const subscribers:Set<()=>void> = new Set();
        let list:T[] = [];
        return new Observable((destination)=>{
            const subscribe = source.subscribe({
                next:(values)=>{
                    subscribers.forEach(unsubscribe => unsubscribe?.());
                    subscribers.clear();
                    list = Array(values.length).fill(undefined);
                    values.forEach((value,index)=>{
                        const subscriber = value?.subscribe((extractedValue)=>{
                            list[index] = extractedValue;
                            destination.next(list);
                        })
                        subscribers.add(()=>subscriber.unsubscribe());
                    })
                    destination.next(list);
                },
                error:(e)=>{
                    destination.error(e);
                },
                complete:()=>{
                    destination.complete();
            }});
            return ()=>{
                subscribe.unsubscribe();
                list = [];
            }
        })
    }
}