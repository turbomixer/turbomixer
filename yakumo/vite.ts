import {register} from "yakumo";
import {build as buildVite} from 'vite';
import * as path from "path";

register('vite',(project)=>{
    Object.keys(project.targets).forEach((dir)=>{
        const directory = path.join(project.cwd , dir);

        buildVite({
            root:directory
        })

    })
})