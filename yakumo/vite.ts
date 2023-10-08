import {register} from "yakumo";
import {build as buildVite} from 'vite';
import * as path from "path";

register('vite',(project)=>{
    Object.keys(project.targets).forEach((dir)=>{
        const directory = path.join(project.cwd , dir);

        buildVite({
            root:directory,
            build:{
                emptyOutDir: true,
                cssCodeSplit: false,
                lib:{
                    entry:path.resolve(directory,'src/index.ts'),
                    formats:['es']
                },
                outDir:'lib/'
            }
        })

    })
})