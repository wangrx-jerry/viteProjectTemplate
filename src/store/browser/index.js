import localforage from 'localforage'

function customStringify(value) {
	// undefined 使用 __UNDEFINED__ 存储
	const processedValue = value === undefined ? '__UNDEFINED__' : value
	// 使用专属关键字 __value__ 存储数据
	return JSON.stringify({ __value__: processedValue })
}

function customParse(data) {
	const parsed = JSON.parse(data)
	// 如果解析后的对象有 __value__ 属性，返回 __value__
	if (parsed && typeof parsed === 'object' && '__value__' in parsed) {
		return parsed.__value__ === '__UNDEFINED__' ? undefined : parsed.__value__
	}
	// 否则，返回解析后的数据本身（兼容旧数据）
	return parsed
}

const createStorage = (storage) => ({
	// 存储数据
	setItem(key, value) {
		try {
			const data = customStringify(value)
			storage.setItem(key, data)
		} catch (error) {
			console.error('Error saving to storage', error)
		}
	},

	// 读取数据
	getItem(key) {
		const data = storage.getItem(key)
		if (data === null) return null // 如果 key 不存在，返回 null

		try {
			return customParse(data)
		} catch {
			// 如果解析失败，说明是旧数据，直接返回原始值
			return data
		}
	},

	// 删除数据
	removeItem(key) {
		storage.removeItem(key)
	},

	// 清空所有数据
	clear() {
		storage.clear()
	}
})

const customSessionStorage = createStorage(sessionStorage)
const customLocalStorage = createStorage(localStorage)

export const getSessionStorageByName = (name) => {
	return customSessionStorage.getItem(name)
}

export const setSessionStorageByName = (name, value) => {
	return customSessionStorage.setItem(name, value)
}

export const removeSessionStorageByName = (name) => {
	customSessionStorage.removeItem(name)
}

export const getLocalStorageByName = (name) => {
	return customLocalStorage.getItem(name)
}

export const setLocalStorageByName = (name, value) => {
	return customLocalStorage.setItem(name, value)
}

export const removeLocalStorageByName = (name) => {
	customLocalStorage.removeItem(name)
}

export const getIndexedDBByName = (name) => {
	return localforage.getItem(name)
}

export const setIndexedDBByName = (name, value) => {
	return localforage.setItem(name, value)
}

export const removeIndexedDBByName = (name) => {
	return localforage.removeItem(name)
}
