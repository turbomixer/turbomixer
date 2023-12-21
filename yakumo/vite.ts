import {register} from "yakumo";
import {build as buildVite} from 'vite';
import * as path from "path";

register('vite',async (project)=>{
    for(let dir of Object.keys(project.targets)){
        const directory = path.join(project.cwd , dir);

        await buildVite({
            root:directory
        })
    }
})