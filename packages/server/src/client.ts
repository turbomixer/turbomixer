import {Socket} from "socket.io";
import {nanoid} from 'nanoid';
import {Context} from "cordis";
import * as fs from "fs";

export interface ProjectClientConnectionConfigure{
    socket:Socket<any,any,any,any>
    root:string
}

export class ProjectClientConnection {

    closeListener: (...args:any[])=>void
    messageListener: (event:string,...args:any[])=>void

    protected socket : Socket<any,any,any,any>

    protected constructor(protected ctx:Context,protected configure:ProjectClientConnectionConfigure) {

        this.socket = configure.socket;

        ctx.on('dispose',()=>{
            this.socket.disconnect();
        })
        this.socket.on('disconnect',this.closeListener = ()=>this.close() )
        this.socket.onAny(this.messageListener = (event, ...args)=> {
            let id = nanoid(16);
            switch (event){
                case 'file/watch-directory':
                    this.watchDirectory(id,args[0]);
                    return {id}
                case 'file/unwatch-directory':
                    this.unwatchDirectory(args[0]);
                    return {}
                case 'file/watch-file':
                    this.watchFile(id,args[0]);
                    return {id}
                case 'file/unwatch-file':
                    this.unwatchFile(args[0]);
                    return {}
                case 'runtime/open':
                    this.watchRuntime(id,args[0]);
                    return {id}
                case 'runtime/close':
                    this.unwatchRuntime(args[0]);
            }
        })
    }

    dispose(){
        this.socket.off('disconnect',this.closeListener);
        this.socket.offAny(this.messageListener)
    }

    close(){
        this.dispose()
        this.ctx.scope.dispose()
    }

    directoryWatchers: Record<string, fs.FSWatcher> = {}

    watchDirectory(id:string,directory:string):void{
        this.directoryWatchers[id] = fs.watch(directory,(event, filename)=>{
            console.info(event,filename);
        })
    }

    unwatchDirectory(id:string):void{

    }

    watchFile(id:string,directory:string):void{

    }

    unwatchFile(id:string):void{

    }

    watchRuntime(id:string,runtime:string):void{

    }

    unwatchRuntime(id:string):void{

    }
}

export class TurboMixerClientManager{

}