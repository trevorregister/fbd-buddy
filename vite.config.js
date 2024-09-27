import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    optimizeDeps: {
        include: ['jquery', 'jquery-ui-dist/jquery-ui', 'draw2d']
    },
    build: {
        commonjsOptions: {
            include: [/jquery/, /jquery-ui/, /draw2d/, /node_modules/]
        }
    },
    resolve: {
        alias: {
            'jquery-ui': 'jquery-ui-dist/jquery-ui.js',
        }
    }
})