import type { RouteRecordRaw } from 'vue-router'

const componentsRouter: RouteRecordRaw[] = [
	{
		path: '/module1/somePage/index',
		component: async () => await import(/* webpackChunkName: "module1" */ '@/views/module1/somePage/index.vue'),
		name: 'Module1SomePage',
		meta: {
			title: '模块 1 页面'
			// 没有 public: true，默认需要权限控制
		}
	}
]

export default componentsRouter
