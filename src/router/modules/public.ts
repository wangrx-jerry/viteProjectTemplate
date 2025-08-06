/*
 * @Description: 用户管理相关路由管理
 * @Author: wrx
 */
import type { RouteRecordRaw } from 'vue-router'

const componentsRouter: RouteRecordRaw[] = [
	{
		path: '/module1/somePage/Public',
		name: 'Module1SomePagePublic',
		component: async () => await import(/* webpackChunkName: "public" */ '@/views/module1/somePage/Public.vue'),
		meta: {
			title: 'Module1SomePagePublic',
			public: true // 标识为公共路由，不需要权限控制
		}
	}
]
export default componentsRouter
