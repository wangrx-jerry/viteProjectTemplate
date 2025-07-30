import router from '@/router'

router.beforeEach(async (_to, _, next) => {
	// 如果需要权限控制，可以在这里添加权限控制逻辑
	next()
})

router.afterEach(() => {
	// NProgress 未导入，暂时注释
	// NProgress.done()
})
