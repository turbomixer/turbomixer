import type * as Blockly from 'blockly'

const _console = console;
const _document = document;
const _window = window;


function couldBeClass(obj, strict) {
    if (typeof obj != "function") return false;
    var str = obj.toString();
    if (obj.prototype === undefined) return false;
    if (obj.prototype.constructor !== obj) return false;
    if (str.slice(0, 5) == "class") return true;
    if (Object.getOwnPropertyNames(obj.prototype).length >= 2) return true;
    if (/^function\s+\(|^function\s+anonymous\(/.test(str)) return false;
    if (strict && /^function\s+[A-Z]/.test(str)) return true;
    if (/\b\(this\b|\bthis[\.\[]\b/.test(str)) {
        if (!strict || /classCallCheck\(this/.test(str)) return true;
        return /^function\sdefault_\d+\s*\(/.test(str);
    }
    return false;
}

function defineProxyInjection(original,map,steel={}){
    let steel_data = {};
    const proxy =  new Proxy(original,{
        get:(o,p)=>{
            if(map[p])
                return map[p];
            if(steel[p])
                return steel_data[p];
            if(typeof original[p] == 'function' && !couldBeClass(original[p],false))
                return (...a)=>original[p](...a);
            return original[p];
        },
        set(o,p,v){
            if(steel[p]){
                steel_data[p] = v;
                return true;
            }
            o[p] = v;
            return true;
        },
        defineProperty(o,p,a){
            if(steel[p]){
                return true;
            }
            return true;
        }
    })
    Array.from(Object.entries(steel)).forEach(s=>{if(s[1]=='self')steel_data[s[0]]=proxy;});
    return proxy;
}

const __self = Symbol('__self__')

function defineElementDisposable(target,extra={},steel={}){
    let listeners = [];
    let childrens = [];
    return {
        element:defineProxyInjection(target,{
            addEventListener:(t,r,c)=>{
                listeners.push([t,r,c]);
                return target.addEventListener(t,r,c);
            },
            appendChild(n){
                childrens.push(n)
                return target.appendChild(n);
            },
            append(n){
                childrens.push(...n)
                return target.append(n);
            },
            prepend(n){
                childrens.push(...n)
                return target.appendChild(n);
            },
            insertBefore(node,child){
                childrens.push(node)
                return target.insertBefore(node,child);
            },
            ...extra
        },steel),
        dispose:()=>{
            listeners.forEach(t=>target.removeEventListener(...t));
            childrens.forEach(t=>target.contains(t) && target.removeChild(t));
        }
    }
}

export function createBlockly():typeof Blockly{
    const module = {
        exports:{}
    };
    const console = {
        info(){
            return;
        },
        warn(){
            return;
        },
        error(){
            return;
        }
    };

    const setTimeout = function(cb,t){
        _window.setTimeout(cb,t);
    }

    const setInterval = function(cb,t){
        _window.setTimeout(cb,t);
    }

    const {element:__head,dispose:disposeDocumentHead}=defineElementDisposable(_document.head);
    const {element:__body,dispose:disposeDocumentBody}=defineElementDisposable(_document.body);
    const {element:document,dispose:disposeDocument}=defineElementDisposable(_document,{body:__body,head:__head});
    const {element:window,dispose:disposeWindow}=defineElementDisposable(_window,{document:document},{Blockly:true,globalThis:'self'});

    const globalThis = window;
    `{{CODE}}`;

    module.exports['__skycover__']={dispose:()=>{
        disposeDocument();
        disposeDocumentHead();
        disposeDocumentBody();
        disposeWindow();
    }}
    return module.exports as any
}