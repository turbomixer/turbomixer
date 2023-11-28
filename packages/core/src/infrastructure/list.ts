import {NavigationEntity} from "../navigation";

export class LinkedMap<T,K>{
    head : LinkedMapValue<T,K> | null = null
    tail : LinkedMapValue<T,K> | null = null

    items : Map<K,LinkedMapValue<T,K>> = new Map<K, LinkedMapValue<T,K>>()

    reversal : Map<T,LinkedMapValue<T,K>> = new Map<T, LinkedMapValue<T,K>>()

    hasItem(){
        return this.head && this.tail
    }

    append(entity:T){
        if(this.has(entity))
            return null;
        if(this.head == null || this.tail == null){
            let newItem =  this.tail = this.head = {
                value:entity,
                next:null,
                previous:null,
                keys:new Set<K>()
            };
            this.reversal.set(entity,newItem);
            return newItem;
        }else{
            let newItem : LinkedMapValue<T,K> = {
                previous: this.tail,
                value: entity,
                next:null,
                keys:new Set<K>()
            }
            this.tail.next = newItem;
            this.reversal.set(entity,newItem);
            return this.tail = newItem;
        }
    }

    addKey(key:K,value:T){
        if(!this.has(value))
            return false;
        const itemValue = this.reversal.get(value) as LinkedMapValue<T,K>;
        this.items.set(key,itemValue);
        itemValue.keys.add(key);
        return true;
    }

    removeKey(key:K){
        if(!this.items.has(key))
            return false;
        const itemValue = this.items.get(key) as LinkedMapValue<T,K>;
        itemValue.keys.delete(key);
        this.items.delete(key);
    }

    remove(entity:T){
        const value = this.reversal.get(entity);
        if(!value)
            return null;
        if(value == this.head)
            this.head = value.next;
        if(value == this.tail){
            this.tail = value.previous;
        }
        if(value.next){
            value.next.previous = value.previous;
        }
        if(value.previous){
            value.previous.next = value.next;
        }
        this.reversal.delete(entity);
        value.keys.forEach((item_key)=>{
            this.items.delete(item_key);
        });
        return value;
    }

    has(entity:T){
        return this.reversal.has(entity);
    }

    get(entity:T){
        return this.reversal.get(entity);
    }

    getItemByKey(key:K){
        return this.items.get(key);
    }

    hasKey(key:K){
        return this.items.has(key);
    }

}

export interface LinkedMapValue<T,K>{
    previous: LinkedMapValue<T,K> | null
    value: T
    next: LinkedMapValue<T,K> | null
    keys:Set<K>
}