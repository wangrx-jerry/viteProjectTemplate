import type { RouteRecordRaw } from 'vue-router'

const componentsRouter: RouteRecordRaw[] = [
	{
		path: 'module1/somePage/index',
		component: async () => await import(/* webpackChunkName: "module1" */ '@/views/module1/somePage/index.vue'),
		name: 'Module1SomePage',
		meta: {
			title: '模块 1 页面'
		}
	}
]

export default componentsRouter
