import {build} from 'esbuild'
import {promises as fs} from 'fs'
export async function runBuild(){
    // Step.1 bundle blockly
    const bundleResult = await build({
        entryPoints:[
            'src/index.js'
        ],
        outfile:'/index.mjs',
        write:false,
        bundle:true,
        platform:'browser',
        format:'cjs'
    })

    const code = new TextDecoder().decode(bundleResult.outputFiles[0].contents);
    // Step.2 add reusable code
    const template = new TextDecoder().decode(await fs.readFile('./scripts/template.ts'));

    await fs.writeFile('lib/index.ts',template.replace('`{{CODE}}`',code))

    await build({
        entryPoints:[
            'lib/index.ts'
        ],
        outfile:'lib/index.js',
        bundle:true,
        platform:'browser',
        format:'esm'
    })

    try{await fs.mkdir('lib')}catch (e) {}

    // Step.3 copy type declarations

    await fs.copyFile('src/bundled.d.ts','lib/index.d.ts')

    await fs.rm('lib/index.ts')

}
runBuild();