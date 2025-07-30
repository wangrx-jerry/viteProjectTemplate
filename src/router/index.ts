// TODO: 不需要权限控制的页面路由分发到业务路由配置中，通过白名单控制是否需要需要权限控制

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'


import publicPageRouter from './modules/public'

export const DEMO = publicPageRouter
const publicPage = ['public.ts'] // 不需要自动加载的router

// you do not need `import app from './modules/*.ts'`
const viewRoutes: RouteRecordRaw[] = []

const routerContext = import.meta.glob('./modules/*.ts', { eager: true })
for (const [key, value] of Object.entries(routerContext)) {
	if (publicPage.some((val) => key.includes(val))) continue
	for (const n of (value as any).default) {
		viewRoutes.push(n)
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
		children: [
			...publicPageRouter
		]
	}
]

export const asyncRoutes: RouteRecordRaw[] = [...viewRoutes]


const router = createRouter({
	history: createWebHistory(),
	routes: constantRoutes
})

export default router
