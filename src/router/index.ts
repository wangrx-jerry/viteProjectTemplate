// 通过路由 meta.public 标识管理公共路由和权限路由

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 使用 Vite 的 glob 导入功能自动加载所有路由模块
const routeModuleFiles = import.meta.glob('./modules/*.ts', { eager: true })

// 分别收集公共路由和需要权限的路由
const publicRoutes: RouteRecordRaw[] = []
const authRoutes: RouteRecordRaw[] = []

for (const [path, module] of Object.entries(routeModuleFiles)) {
	const routeModule = module as { default: RouteRecordRaw[] | RouteRecordRaw }
	const routes = Array.isArray(routeModule.default) ? routeModule.default : [routeModule.default]

	// 根据 meta.public 标识分类路由
	for (const route of routes) {
		if (route.meta?.public) {
			publicRoutes.push(route)
		} else {
			authRoutes.push(route)
		}
	}
}

// 常量路由：不需要权限控制的路由
export const constantRoutes: RouteRecordRaw[] = [
	{
		path: '/:pathMatch(.*)*',
		name: 'err404',
		component: async () => await import(/* webpackChunkName: "404" */ '@/views/error/404.vue')
	},
	{
		path: '/',
		component: () => import('@/views/home/index.vue'),
		children: [...publicRoutes] // 使用自动收集的公共路由
	}
]

// 异步路由：需要权限控制的路由
export const asyncRoutes: RouteRecordRaw[] = [...authRoutes]

// 导出供调试使用
export const DEMO = { publicRoutes, authRoutes }

const router = createRouter({
	history: createWebHistory(),
	// 后期如果需要权限控制，需要对authRoutes 按权限过滤后通过 addRoute 添加路由
	// 这里先注册所有需要权限的路由
	routes: [...constantRoutes, ...authRoutes] // 注册所有需要权限的路由
})

export default router
