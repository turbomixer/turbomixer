import {Service, Context, Editors} from ".";

export class TutorialService extends Service{
    constructor(ctx:Context) {
        super(ctx,'tutorial');
    }

    add<E extends keyof Editors>(editor:E,name:string){

    }

    attach(element:HTMLElement){

    }

    detach(){

    }

    show(){

    }

    hide(){

    }
}