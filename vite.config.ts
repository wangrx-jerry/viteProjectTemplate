import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: "/",
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"), // 路径别名：设置 `@` 指向 `src` 目录
        },
    },
    server: {
        port: 3333, // 设置服务启动端口号
        open: true, // 设置服务启动时是否自动打开浏览器
        cors: true, // 允许跨域
        // 接口代理，将请求代理到目标环境
        proxy: {
            "/xx-api": {
                target: "http://xxx.com/xx-api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/xx-api/, ""),
            },
        },
    },
});
