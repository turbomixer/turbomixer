import {register} from "yakumo";
import path from "path";
import {build as buildVite} from "vite";
import {build} from "esbuild";

register("plugin",async (project)=>{
    for(let dir of Object.keys(project.targets)){
        const directory = path.join(project.cwd , dir);
        await buildVite({
            root:directory,
            build: {
                emptyOutDir: true,
                cssCodeSplit: false,
                lib: {
                    entry: path.resolve(directory, './src/index.ts'),
                    formats: ['cjs'],
                    fileName:'index'
                },
                outDir: 'lib/',
                rollupOptions:{
                    external:['@turbomixer/core']
                }
            },
        })
    }
})