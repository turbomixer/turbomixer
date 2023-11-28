import {BehaviorSubject} from "rxjs";
import {Project} from "./project";
import {Context} from "cordis";

export interface RuntimeInfo{
    id:string
    name:string
}

export enum RuntimeStatus{
    STOPPED,
    RUNNING,
    PAUSED,
    DEBUGGING,
    BREAKPOINT
}

export interface Runtime<T extends Project<Context>>{

    version: BehaviorSubject<string>;

    updated_at: BehaviorSubject<string>;

    status: BehaviorSubject<RuntimeStatus>;

    connect():Promise<void>

    disconnect():Promise<void>

    start():Promise<void>;

    stop():Promise<void>;

    deploy(project:T):Promise<void>;

}