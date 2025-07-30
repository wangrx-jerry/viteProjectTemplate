import router from '@/router'

router.beforeEach(async (to, _, next) => {
	// 如果需要权限控制，可以在这里添加权限控制逻辑
	next()
})

router.afterEach(() => {
	NProgress.done()
})
