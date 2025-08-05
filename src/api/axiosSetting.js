/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
// import Vue from 'vue'
import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

const service = axios.create({
	baseURL: `${window.location.protocol}//${window.location.host}/`,
	// baseURL: 'http://dev.elinkadmin.com:8211',
	timeout: 600000,
	contentType: 'application/json'
})

// 存储 cancelPreviousRequest 配置项 为 true，且正在请求中的请求的 中止方法
const cancelRequestMap = {}

let loading = null
let loadingCount = 0
let timer = null
let loadingTimer = null
const options = {
	lock: true,
	text: '加载中～',
	background: 'rgba(0, 0, 0, 0.7)',
	customClass: 'printHide'
}

function startLoading(config) {
	if (config.notShowLoading) return
	timer && clearTimeout(timer) // 300ms 内连续发起的请求复用上一个loading
	loadingCount++

	if (!loading && !loadingTimer) {
		loadingTimer = setTimeout(() => {
			if (loadingCount <= 0) return // 防止所有接口都返回了才触发loading
			loading = ElLoading.service(options)
		}, 1000)
	}
}
function endLoading(config) {
	if (config?.notShowLoading) return
	loadingCount--

	if (loadingCount <= 0) {
		timer = setTimeout(() => {
			// 防止 < 0 的异常情况
			loadingCount = 0
			loading?.close()
			loading = null
			clearTimeout(loadingTimer)
			loadingTimer = null
		}, 300)
	}
}

function getRequestKey(config) {
	const url = config.url
	const method = config.method || 'get'
	return `${method} ${url}`
}

function cacheCancelRequest(config) {
	const controller = new AbortController()
	config.signal = controller.signal
	cancelRequestMap[getRequestKey(config)] = controller
}

function cancelPreviousRequestIfExist(config) {
	const controller = cancelRequestMap[getRequestKey(config)]
	controller && controller.abort()
}

function removeCancelRequest(config) {
	if (config?.cancelPreviousRequest) {
		delete cancelRequestMap[getRequestKey(config)]
	}
}

service.interceptors.request.use(
	(config) => {
		if (config.cancelPreviousRequest) {
			cancelPreviousRequestIfExist(config)
			cacheCancelRequest(config)
		}
		// hack git 缓存

		if (config.method?.toLowerCase() === 'get') {
			if (config.url.includes('?')) {
				config.url = config.url + `&spm=${+new Date()}`
			} else {
				config.url = config.url + `?spm=${+new Date()}`
			}
		}
		startLoading(config)
		return config
	},
	(error) => {
		endLoading(error?.config)
		return Promise.reject(error)
	}
)

service.interceptors.response.use(
	(response) => {
		endLoading(response.config)
		removeCancelRequest(response.config)
		if (response.headers['content-type'] === 'application/octet-stream;charset=utf-8') {
			const data = response?.data || response
			const fileName = decodeURI(response.headers['content-disposition'].split(';')[1].split("''")[1])
			return {
				data,
				fileName
			}
		}
		try {
			// 请求授权失败则重新跳转到登录页
			if (response.data.code === 401) {
				// 处理 401
			}
			// 根据后台标识判断后台返回信息是否正常
			if (response.data.code !== 200 && response.data.msg) {
				ElMessage({
					message: response.data.msg,
					type: 'warning',
					showClose: true
				})
			}
			// 处理：responseType = blob 情况下，后端报错
			if (response && response.data instanceof Blob && response.data.type === 'application/json') {
				response.data.text().then((text) => {
					const blobError = JSON.parse(text)
					ElMessage({
						message: blobError.msg,
						type: 'warning',
						showClose: true
					})
				})
			}
		} catch (e) {
			Error(e)
		}
		if (response.data.code === 200 && response.data.data === null) return { data: { data: true } }
		return response.data
	},
	(error) => {
		endLoading(error?.config)
		removeCancelRequest(error?.config)
		try {
			if (/Network Error|504/.test(error.message)) {
				// 网络错误/504
				return ElMessage({
					message: '暂无网络连接，请连接后重新尝试',
					type: 'warning',
					showClose: true
				})
			}
			if (/timeout of /.test(error.message)) {
				// 网络错误/504
				return ElMessage({
					message: '请求超时',
					type: 'warning',
					showClose: true
				})
			}
		} catch (e) {
			Error(e)
		}
		return Promise.reject(error)
	}
)
export default service
