// TODO: 打包优化体积优化，参考：https://segmentfault.com/a/1190000041464140?sort=newest
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path, { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import'

import { PROXY_URL_MAP } from './src/static/environment'
import viteDevProxyInfo from './vite-plugins/dev-proxy-info'
// 是否为快速构建: 快速构建时，不进行降级兼容、保留console & debugger
const fasterBuild = ['test', 'test2'].includes(process.env.npm_config_target_server as string)

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		!fasterBuild &&
			legacy({
				targets: ['chrome >= 69'],
				renderLegacyChunks: false,
				modernPolyfills: true,
				renderModernChunks: true
			}),
		process.env.NODE_ENV === 'development' &&
			TurboConsole({
				prefix: `${new Date().toLocaleString()}`,
				highlight: {
					themeDetect: true,
					extendedPathFileNames: ['static', 'tool', 'index', 'Detail', 'api']
				},
				// 启用编辑器跳转功能
				launchEditor: {
					specifiedEditor: 'cursor'
				}
			}),
		AutoImport({
			imports: [
				'vue',
				'vuex',
				'vue-router',
				// lodash-es 函数自动按需导入
				{
					from: 'lodash-es',
					imports: [
						'omit',
						'pick',
						'intersection',
						'uniq',
						'uniqBy',
						'keyBy',
						'groupBy',
						'cloneDeep',
						'isEqual',
						'debounce',
						'throttle',
						'unionBy',
						'uniqueId',
						'difference',
						'findLastIndex',
						'defaults',
						'defaultsDeep',
						'sortBy'
					]
				},
				{
					dayjs: [['default', 'dayjs']]
				}
			],
			dirs: ['src/hooks', 'src/utils', 'src/static', 'src/store/browser'],
			dts: 'typings/auto-import.d.ts',
			vueTemplate: true,
			eslintrc: { enabled: false } // 需要更新 .eslintrc-auto-import.json 文件时，再打开重新运行
		}),
		Components({
			extensions: ['vue', 'jsx'],
			dts: 'typings/component.d.ts'
		}),
		createStyleImportPlugin({
			resolves: [VxeTableResolve()],
			libs: [
				{
					libraryName: '@formily/element-plus',
					esModule: true,
					resolveStyle: (name) => {
						return `@formily/element-plus/esm/${name}/style.js`
					}
				}
			]
		}),

		viteCompression({
			verbose: true, // 默认即可
			disable: true, //是否开启
			deleteOriginFile: false, //删除源文件
			filter: /\.(js|mjs|json|css|html)$/i,
			threshold: 10240, //压缩前最小文件大小
			algorithm: 'gzip', //压缩算法
			ext: '.gz' //文件类型
		}),
		ViteImageOptimizer({
			test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
			exclude: undefined,
			include: undefined,
			includePublic: true,
			logStats: true,
			ansiColors: true,
			svg: {
				multipass: true,
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								cleanupNumericValues: false,
								removeViewBox: false // https://github.com/svg/svgo/issues/1128
							},
							cleanupIDs: {
								minify: false,
								remove: false
							},
							convertPathData: false
						}
					},
					'sortAttrs',
					{
						name: 'addAttributesToSVGElement',
						params: {
							attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }]
						}
					}
				]
			}
		}),
		visualizer({
			open: false,
			gzipSize: true
		}),
		{
			name: 'inject-env-branch',
			transformIndexHtml(html) {
				return html.replace(
					/<head>/,
					`<head>
						<script>
						window.envBranch = "${process.env.VITE_APP_BRANCH}";
						</script>
					`
				)
			}
		},
		process.env.NODE_ENV === 'development' && viteDevProxyInfo()
	],
	resolve: {
		alias: {
			// 路径映射必须以/开头和结尾
			'@': resolve(__dirname, 'src'),
			'~': `${path.resolve(__dirname, 'src')}`
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				silenceDeprecations: ['legacy-js-api'],
				additionalData: '@use "@/assets/styles/variables.scss" as *;'
			}
		}
	},
	base: '/', // 设置打包路径
	server: {
		port: 4001, // 设置服务启动端口号
		open: true, // 设置服务启动时是否自动打开浏览器
		cors: true, // 允许跨域
		proxy: {
			'/client-api': {
				// target: PROXY_URL_MAP.dev,
				target: PROXY_URL_MAP.test,
				// target: PROXY_URL_MAP.release,
				// target: PROXY_URL_MAP.master,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/client-api/, '')
			},
			'/ali-oss': {
				// target: 'http://dev.www.zlyelinkadmin.com/ali-oss',
				target: 'http://test.www.zlyelinkadmin.com/ali-oss',
				// target: 'http://192.168.17.94:8890/ali-oss',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/ali-oss/, '')
			}
		}
		// allowedHosts: ['myapp.com']
	},
	build: {
		sourcemap: false,
		reportCompressedSize: false,
		target: ['chrome69']
	},
	esbuild: {
		// 开发环境不过滤
		drop: process.env.NODE_ENV === 'development' || fasterBuild ? [] : ['console', 'debugger']
	}
})
