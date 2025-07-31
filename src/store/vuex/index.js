import { createLogger, createStore } from 'vuex'

import getters from './getters'
import someModule from './modules/someModule'

// const modules = {}
// const routerContext = import.meta.glob('./modules/*.js')
// for (const [key, value] of Object.entries(routerContext)) {
// 	Object.assign(modules, value.default)
// 	// for (const n of value.default) {
// 	// }
// }
// console.log('modules', modules)
// console.log('getters', getters)
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
	modules: {
		someModule
	},
	getters
})
export default store
