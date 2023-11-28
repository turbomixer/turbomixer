const Koa = require('koa');
const Router = require('@koa/router');
const http = require("http");
const {Server} = require("socket.io")
const {promises:fs} = require("fs");
const path = require("path");

const app = new Koa();
const router = new Router();

router.get('/turbomixer/api/projects',(ctx,next)=>{
    ctx.body = [
        {"id":"ol0bhUQaIVse3RVQ_e961","name":"测试项目01"}
    ]
})

router.get('/turbomixer/api/projects/:project', (ctx, next) => {
    ctx.body = {
        name:"测试项目",
        description:"",
        server:"http://localhost:8788"
    };
});

router.get(/^\/turbomixer\/api\/projects\/([^/]+)\/files\/(.*)/,async (ctx,next)=>{
    const url = path.join(__dirname,"projects",ctx.params[0] ?? "/",ctx.params[1] ?? "./");
    console.info(url);
    if(ctx.query['method'] === 'list')
        ctx.body = (await fs.readdir(url,{withFileTypes:true})).map(file=>({
            name:file.name,
            type:file.isDirectory() ? 'directory' : 'file'
        }))
    else if(ctx.query['method'] === 'read'){
        ctx.body = await fs.readFile(url);
    }
})

router.post(/^\/turbomixer\/api\/projects\/([^/]+)\/files\/(.*)/,async (ctx,next)=>{
    const url = path.join(__dirname,"projects",ctx.params[0] ?? "/",ctx.params[1] ?? "./");
    console.info(url);
    if(ctx.query['method'] === 'write'){
        ctx.body = {}
        const file = await fs.open(url,'w');
        ctx.req.on('data',(data)=>{
            fs.writeFile(file,data)
        })
    }
})
app
    .use((ctx,next)=>{
        ctx.res.setHeader("Access-Control-Allow-Origin","*")
        return next()
    })
    .use(router.routes())
    .use(router.allowedMethods());

const server = http.createServer(app.callback())

const socket = new Server(server,{cors: {
        origin: "*"
    }});

socket.of(/^\/projects\/([\w-]+)/).on('connection', (socket) => {
    console.info('a user connected');
    socket.on('watch',(data,callback)=>{
        console.info(callback)
        callback({
            id:'NoneHandler'
        });
    })

    socket.onAny((eventName, ...args) => {
        console.info(eventName,args)
    });
});

server.listen(8788, () => {
    console.log('server running at http://localhost:8788');
});