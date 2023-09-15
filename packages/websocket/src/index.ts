import {Service} from '@turbomixer/core'
import {Context} from "cordis";

export class WebsocketChannelPlugin extends Service{

    socket? : WebSocket;

    server?: string

    token?:string

    constructor(ctx:Context) {
        super(ctx,'websocket');
    }

    connect(){
        if(this.socket && this.socket.readyState != WebSocket.CLOSED)
            this.socket.close();
        if(!this.server || !this.token)
            return;

        this.socket = new WebSocket(this.server,this.token)

        const that = this;

        this.socket.onopen = function (){
            this.send(JSON.stringify({
                type:'authentication',
                token:that.token
            }))
        }

        this.socket.onmessage = function (event){
            that.message(this,event.data)
        }
    }

    message(socket:WebSocket,data:any){
        if(!data.type)
            return;
        switch (data.type){
        }
    }
}