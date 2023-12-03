import type {Router} from '@satorijs/router'
import {Context, Service} from './app'
import {Server as SocketIOServer} from "socket.io";
import {Server as HttpServer, createServer as createHttpServer} from "http";
import Koa from 'koa'
import KoaRouter from '@koa/router'
import {ProjectClientConnection, ProjectClientConnectionConfigure} from "./client";
import {remove} from 'cosmokit'

declare module "."{
    interface Context{
        turbomixer_server:TurboMixerServer
    }
}

export interface TurboMixerServerConfig{
    port?:number
}

export class TurboMixerRouter extends KoaRouter{
    constructor(protected ctx:Context) {
        super();
    }
}

export class TurboMixerServer extends Service{

    http:HttpServer

    socket: SocketIOServer

    koa: Koa

    router: TurboMixerRouter

    constructor(ctx:Context,protected config:TurboMixerServerConfig) {
        super(ctx, 'turbomixer_server');
        this.koa = new Koa();
        this.http = createHttpServer(this.koa.callback());
        this.socket = new SocketIOServer(this.http);
        this.router = new TurboMixerRouter(this.ctx);
        this.koa
            .use(this.router.routes())
            .use(this.router.allowedMethods())

        const nsp = this.socket
            .of(/^\/projects\/([\w-]+)/)

        nsp.on('connection',async (socket)=>{
            console.info("Connection",nsp.name);
            let path = await this.ctx.project.path(nsp.name);
            if(!path){
                socket.emit('hello',{error:'project.not_found'})
                socket.disconnect();
                return;
            }
            this.ctx.plugin<ProjectClientConnectionConfigure>(ProjectClientConnection,{
                socket:socket,
                root:path
            })
        })

        let apiRouter = new KoaRouter({prefix:'/api'});


        apiRouter.get('/projects',async (ctx,next)=>{
            console.info("Project")
            ctx.body = await this.ctx.project.list();
        })

        apiRouter.get('/projects\/([^/]+)\/files\/(.*)',async (ctx,next)=>{
            switch (ctx.accepts(['application/auto-detect','application/directory+json','application/octet-stream'])){
                case 'application/directory+json':
                    await this.ctx.project.get(ctx,ctx.params[0],ctx.params[1] ?? '/','directory')
                    return;
                case 'application/octet-stream':
                    await this.ctx.project.get(ctx,ctx.params[0],ctx.params[1] ?? '/','file')
                    return;
                default:
                    ctx.body = {error:'Only application/directory+json or application/octet-stream is supported',header:'Accept',validValues:['application/directory+json','application/octet-stream']};
                    ctx.status = 406;
            }
        })

        this.router.use(apiRouter.routes());
    }

    async start(){
        this.http.listen(this.config.port ?? 5200);
    }

    async stop(){
        this.socket.disconnectSockets();
        this.socket.close();
        this.http.closeAllConnections();
        this.http.close();
    }

    register(...args: Parameters<KoaRouter['register']>) {
        const layer = this.router.register(...args)
        const context = this[Context.current]
        context?.state.disposables.push(() => {
            remove(this.router.stack, layer)
        })
        return layer
    }
}