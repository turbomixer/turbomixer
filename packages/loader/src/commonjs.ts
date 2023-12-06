export namespace CommonJS{
    export function wrap(code:string){
        return `(function(exports, require, module, __filename, __dirname) {
${code}
});`
    }
}