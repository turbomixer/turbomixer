import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        emptyOutDir: true,
        cssCodeSplit: false,
        lib: {
            entry: path.resolve(directory, 'src/index.ts'),
            formats: ['es']
        },
        outDir: 'lib/'
    },
    plugins: [vue()],
})
