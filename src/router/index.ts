// TODO: 不需要权限控制的页面路由分发到业务路由配置中，通过白名单控制是否需要需要权限控制

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import publicPageRouter from './modules/public'

export const DEMO = publicPageRouter
const publicPage = ['public.ts'] // 不需要自动加载的router

// 使用 Vite 的 glob 导入功能自动加载所有路由模块
const routeModuleFiles = import.meta.glob('./modules/*.ts', { eager: true })
const viewRoutes: RouteRecordRaw[] = []

for (const [path, module] of Object.entries(routeModuleFiles)) {
	// 提取模块名：./modules/module1.ts -> module1
	const moduleName = path.replace('./modules/', '').replace('.ts', '')

	// 跳过排除的模块
	if (publicPage.some((file) => moduleName.includes(file.replace('.ts', '')))) continue

	// 展开路由配置
	const routeModule = module as { default: RouteRecordRaw[] | RouteRecordRaw }
	if (Array.isArray(routeModule.default)) {
		viewRoutes.push(...routeModule.default)
	} else {
		viewRoutes.push(routeModule.default)
	}
}

export const constantRoutes: RouteRecordRaw[] = [
	{
		path: '/:pathMatch(.*)*',
		name: 'err404',
		component: async () => await import(/* webpackChunkName: "404" */ '@/views/error/404.vue')
	},
	{
		path: '/',
		component: () => import('@/views/home/index.vue'),
		children: [...publicPageRouter]
	}
]

export const asyncRoutes: RouteRecordRaw[] = [...viewRoutes]

const router = createRouter({
	history: createWebHistory(),
	routes: [...constantRoutes, ...viewRoutes]
})

export default router
