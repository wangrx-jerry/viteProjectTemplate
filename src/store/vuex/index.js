import { createLogger, createStore } from 'vuex'

import getters from './getters'

// 使用 Vite 的 glob 导入功能自动加载所有模块
const moduleFiles = import.meta.glob('./modules/*.js', { eager: true })
const modules = {}
for (const path in moduleFiles) {
	// 提取文件名作为模块名：./modules/module1.js -> module1
	const moduleName = path.replace('./modules/', '').replace('.js', '')
	modules[moduleName] = moduleFiles[path].default
}

console.log('自动导入的模块:', modules)

const debug = process.env.NODE_ENV !== 'production'
const logger = createLogger({
	filter(mutation, stateBefore, stateAfter) {
		// 若 mutation 需要被记录，就让它返回 true 即可
		// 顺便，`mutation` 是个 { type, payload } 对象
		// return ['tagsView/ADD_CACHED_VIEW', 'tagsView/DEL_CACHED_VIEW'].includes(mutation.type)
	},
	actionFilter(action, state) {
		// 和 `filter` 一样，但是是针对 action 的
		// `action` 的格式是 `{ type, payload }`
		// if (['tagsView/addCachedView'].includes(action.type)) {
		// 	console.log('state', state.tagsView.cachedViews)
		// 	return true
		// }
	}
})
const plugins = debug ? [logger] : []
const store = createStore({
	plugins,
	modules,
	getters
})
export default store
