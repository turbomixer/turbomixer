import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";

// https://vitejs.dev/config/
console.info(__dirname)
export default defineConfig({
    plugins: [vue()],
    build:{
        outDir:'lib/'
    }
})
