import {register} from "yakumo";
import path from "path";
import {build as buildVite} from "vite";
import {build} from "esbuild";
import vue from "@vitejs/plugin-vue";
import dts from 'vite-plugin-dts';
register("plugin",async (project)=>{

    for(let dir of Object.keys(project.targets)){
        const directory = path.join(project.cwd , dir);
        await buildVite({
            root:directory,
            build: {
                emptyOutDir: true,
                cssCodeSplit: false,
                lib: {
                    entry: path.resolve(directory, './client/index.ts'),
                    formats: ['cjs'],
                    fileName:'index'
                },
                outDir: 'dist/',
                rollupOptions:{
                    external:['@turbomixer/core']
                }
            },
            plugins:[
                vue(),
                dts({
                    compilerOptions:{
                        rootDir:path.resolve(directory, './client/'),
                        outDir:path.resolve(directory, './dist/'),
                    },
                    include:["client"]
                })
            ]
        })
    }



})