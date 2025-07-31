import 'nprogress/nprogress.css' // progress bar style

import NProgress from 'nprogress' // progress bar

import router from '@/router/index.ts'

NProgress.configure({ showSpinner: false })

router.beforeEach(async (_to, _, next) => {
	NProgress.start()
	// 如果需要权限控制，可以在这里添加权限控制逻辑
	next()
})

router.afterEach(() => {
	NProgress.done()
})
