import {Editor} from "./editor";
import {Project} from "./project";

export interface ChannelProject{
    id:string,
    name:string
}

export interface Channel{
    getProjects():ChannelProject[]
    openProject(id:string):Project
}

declare module '.'{
    interface Context{
        channel:Channel
    }

    interface Events{
        'channel.connected'():void;
        'channel.disconnected'():void;
        'channel.error'():void;

        'channel.projects.modify'():void;// @todo
    }
}

