import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        emptyOutDir: true,
        cssCodeSplit: false,
        lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            formats: ['es']
        },
        outDir: 'lib/'
    },
    plugins: [vue()],
})
