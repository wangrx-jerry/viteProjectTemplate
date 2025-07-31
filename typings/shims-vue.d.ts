declare module '*.vue' {
	import type { DefineComponent } from 'vue'

	const component: DefineComponent<{}, {}, any>
	export default component
}

/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
export {}
declare module 'vue' {
	interface ComponentCustomProperties {
	}
}
