// eslint-disable-next-line simple-import-sort/imports
import '@/router/permission'
import '@/assets/styles/element.scss'
import 'animate.css'
import '@/utils/prototypeExpand.js'
import '@/assets/styles/index.scss'
import '@/plugins/defaultElementProps.ts'
import Element, { dayjs } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { createApp } from 'vue'

import service from '@/api/axiosSetting.js'
// import store from '@/store/vuex/index.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

dayjs.en.weekStart = 1

import App from './App.vue'
import router from './router/index'

const app = createApp(App)
app.config.globalProperties.axios = service

app.use(router)
	.use(Element)
	// .use(store)
	.mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}

// setupAutoResourceReloadOnce()
