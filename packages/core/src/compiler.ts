import {Document} from "./document";

export interface Compiler{
    compile(document:Document,files:Record<string, Document>);
}