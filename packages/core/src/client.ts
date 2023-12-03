import {Context, ProjectDescriptor, Service} from ".";
import {Awaitable} from "./infrastructure/promises";

declare module "."{
    interface Context{
        clients:ClientService
    }
}

export abstract class Client<C extends Context = Context>{

    static reusable = true;

    static inject = ['clients'];

    protected ctx : C;

    name:string = '';

    online: boolean = false;

    protected constructor(ctx:C, public key:string) {
        this.ctx = ctx;
        ctx.on('ready', async () => {
            await Promise.resolve()
            await this.start()
            ctx.clients.add(key,this);
            await this.connect();
        })

        ctx.on('dispose', async () => {
            await this.disconnect();
            ctx.clients.remove(key);
            await this.stop();
        })

    }

    abstract start():Awaitable<void>;

    abstract stop():Awaitable<void>;

    abstract connect():Awaitable<void>;

    abstract disconnect():Awaitable<void>

    abstract list():Awaitable<ProjectDescriptor[]>

    abstract open(id:string):Awaitable<()=>void>;
}

export class ClientService extends Service{

    constructor(ctx:Context) {
        super(ctx,'clients');
    }

    clients : Map<string,Client> = new Map;

    add(key:string,client:Client):void{
        console.info(key,client);
        this.clients.set(key,client);
    }

    remove(key:string):void{
        this.clients.delete(key);
    }

    get(key:string):Client | null{
        return this.clients.get(key) ?? null;
    }

    list():Client[]{
        return [...this.clients.values()];
    }

    close(){

    }

}