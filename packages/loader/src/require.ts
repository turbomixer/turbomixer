import {Context} from '@turbomixer/core';

function createRequire(ctx:Context):(id: string)=>any{
    return (module: string) => {
        return new Proxy({}, {
            get(target: any, name: string) {
                return ctx.module.get(module)[name]
            }
        })
    }
}

export {createRequire};