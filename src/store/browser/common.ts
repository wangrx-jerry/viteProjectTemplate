import { ElMessage } from 'element-plus'
import localforage from 'localforage'
import { chunk } from 'lodash-es'

import store from '@/store/vuex'

// 获取缓存的 key
// 完整的 key: `{mainKey}_${subKey}_${pathname}_${userId}_${lifetime}`
export function getStorageKey(mainKey: string, options?: AppCacheOptions) {
	const includeUserId = options?.includeUserId ?? true
	let result = mainKey
	// 加上 subKey
	if (options?.subKey) result += `_${options?.subKey}`
	// 加上 pathname
	result += `_${options?.pathname || location.pathname}`
	// 加上 userId
	if (includeUserId) result += `_${store.getters?.userInfo?.userId as string}`
	// 加上 lifetime
	result += `_${options?.lifetime || 'always'}`
	return result
}

// 存储所有的 AppCache 的 {key -> 最近使用时间,大小} 信息
export const APP_CACHE_ALL_STORAGE_INFO = '_appCacheAllStorageInfo'

// 存储 最近一次清除 AppCache 的日期
export const LAST_CLEAR_APP_CACHE_DATE = '_lastClearAppCacheDate'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

const MAX_STORAGE_SIZE = 150 * 1024 // 150KB

interface StorageInfo {
	/** 最近使用时间 */
	lastTime: number
	/** 大小 */
	size?: number
}

export const STORAGE_MAIN_KEY_LIST = ['formRequired', 'tableInnerFilter', 'tableOuterFilter', 'other'] as const

const STORAGE_MAIN_KEY_REG = new RegExp(`^(${STORAGE_MAIN_KEY_LIST.join('|')})`)

export type MainKey = (typeof STORAGE_MAIN_KEY_LIST)[number]

// 存储类型: 'local'（默认）或 'session' 或 'indexedDB'
export type StorageType = 'local' | 'session' | 'indexedDB'

// 存储范围: 'local'（默认）或 'session' 或 'indexedDB' 或 'all'
export type StorageTypeRange = StorageType | 'all'

export interface AppCacheOptions<T extends StorageType = 'local'> {
	/** 存储数据时的 subKey，当一个页面上存在多个相同 mainKey 的缓存时，需要使用 subKey 来做区分 */
	subKey?: string
	/**
	 * 默认: always, 存储数据 保存时间 的类型;
	 * always: 一直存在 (关闭页面, 退出登录 也会存在);
	 * page: 只在当前页面存在 (页面的 tag 只要存在，缓存就会存在，退出登录、关闭页面 都会没有)
	 */
	lifetime?: 'always' | 'page'
	/** 默认: true, 存储 storage 的 key 中是否包含 userId (用于设置: 是否区分用户) */
	includeUserId?: boolean
	/** 默认: 当前页面的 location.pathname, 指定 设置缓存 的页面路径 */
	pathname?: string
	/**
	 * 存储方案: 'local'（默认）或 'session' 或 'indexedDB'，决定数据存储在 localStorage 还是 sessionStorage 还是 indexedDB
	 */
	storageType?: T
}

/**
 * 设置 缓存 到 AppCache
 * @param {MainKey} mainKey 缓存的类型, tableInnerFilter 默认会 缓存数据直到页面 tag 被关闭，其它情况默认会持久存储数据
 * @param {Elink.AnyObject} data 存储的数据
 * @param {AppCacheOptions} options 配置选项
 */
function set<T extends StorageType, R = T extends 'indexedDB' ? Promise<any> : undefined>(
	mainKey: MainKey,
	data: any,
	options?: AppCacheOptions<T>
): R {
	notifyErrorWhenInvalidMainKey(mainKey)
	const defaultLifeTime = ['tableInnerFilter'].includes(mainKey) ? 'page' : 'always'
	const storageKey = getStorageKey(mainKey, {
		subKey: options?.subKey,
		pathname: options?.pathname || location.pathname,
		lifetime: options?.lifetime || defaultLifeTime,
		includeUserId: options?.includeUserId !== false
	})

	const storageType = options?.storageType || 'local'
	if (storageType === 'session') {
		setSessionStorageByName(storageKey, data)
		return undefined as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	} else if (storageType === 'indexedDB') {
		return (recordStorageInfoForIndexedDB({ storageKey }) as Promise<void>).then(() => {
			return setIndexedDBByName(storageKey, data)
		}) as R // 指定为 R 类型，以兼容返回值声明的 R 类型
	} else {
		setLocalStorageByName(storageKey, data)
		const diskSize = getStorageSize(storageKey, localStorage.getItem(storageKey))
		// 只检测 localStorage 中的缓存大小
		notifyErrorWhenSizeExceed(storageKey, diskSize)
		recordStorageInfoForLocalStorage({ storageKey, size: diskSize }) // 只在设置缓存时，更新大小
		return undefined as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	}
}

/**
 * 从 AppCache 中获取缓存
 * @param {MainKey} mainKey 缓存的类型, tableInnerFilter 默认会 缓存数据直到页面 tag 被关闭，其它情况默认会持久存储数据
 * @param {AppCacheOptions} options 配置选项
 */
function get<T extends StorageType, R = T extends 'indexedDB' ? Promise<any> : any>(mainKey: MainKey, options?: AppCacheOptions<T>): R {
	notifyErrorWhenInvalidMainKey(mainKey)
	const defaultLifeTime = ['tableInnerFilter'].includes(mainKey) ? 'page' : 'always'
	const storageKey = getStorageKey(mainKey, {
		subKey: options?.subKey,
		pathname: options?.pathname || location.pathname,
		lifetime: options?.lifetime || defaultLifeTime,
		includeUserId: options?.includeUserId !== false
	})

	const storageType = options?.storageType || 'local'
	if (storageType === 'session') {
		return getSessionStorageByName(storageKey) as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	} else if (storageType === 'indexedDB') {
		return getIndexedDBByName(storageKey).then((data) => {
			// get 时，若 data 不为 null，则记录 storage 的 最近访问时间
			if (data !== null) {
				recordStorageInfoForIndexedDB({ storageKey })
			}
			return data as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
		}) as R // 指定为 R 类型，以兼容返回值声明的 R 类型
	} else {
		const data = getLocalStorageByName(storageKey)
		if (data !== null) {
			// get 时，若 data 不为 null，则记录 storage 的 最近访问时间
			recordStorageInfoForLocalStorage({ storageKey })
			// 只检测 localStorage 中的缓存大小
			notifyErrorWhenSizeExceed(storageKey) // 这里需要拿到存储数据的字符串
		}
		return data as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	}
}

/**
 * 从 AppCache 中移除缓存
 * @param {MainKey} mainKey 缓存的类型, tableInnerFilter 默认会 缓存数据直到页面 tag 被关闭，其它情况默认会持久存储数据
 * @param {AppCacheOptions} options 配置选项
 */
function remove<T extends StorageType, R = T extends 'indexedDB' ? Promise<void> : void>(mainKey: MainKey, options?: AppCacheOptions<T>): R {
	notifyErrorWhenInvalidMainKey(mainKey)
	const defaultLifeTime = ['tableInnerFilter'].includes(mainKey) ? 'page' : 'always'
	const storageKey = getStorageKey(mainKey, {
		subKey: options?.subKey,
		pathname: options?.pathname || location.pathname,
		lifetime: options?.lifetime || defaultLifeTime,
		includeUserId: options?.includeUserId !== false
	})
	if (options?.storageType === 'session') {
		removeSessionStorageByName(storageKey)
		return undefined as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	} else if (options?.storageType === 'indexedDB') {
		return removeStorageInfoForIndexedDB(storageKey).then(() => removeIndexedDBByName(storageKey)) as R // 指定为 R 类型，以兼容返回值声明的 R 类型
	} else {
		removeLocalStorageByName(storageKey)
		removeStorageInfoForLocalStorage(storageKey)
		return undefined as R // 返回 undefined 类型，并指定 R 类型 (因为函数的返回值类型是 R，若没有返回值则会报错；直接返回 undefined 会报错: 不兼容 R 类型)
	}
}

/** 设置/获取 应用缓存 (表格外面的顶部筛选，表格里面的表头筛选，表单的必填项缓存) */
export const AppCache = {
	set,
	get,
	remove
}

// 当 mainKey 不在 STORAGE_MAIN_KEY_LIST 中时，提示错误
function notifyErrorWhenInvalidMainKey(mainKey: MainKey) {
	if (process.env.NODE_ENV !== 'development') return

	if (!STORAGE_MAIN_KEY_LIST.includes(mainKey)) {
		ElMessage.error({
			message: `【AppCache】错误的 mainKey: ${mainKey}，应该在这个范围: ${STORAGE_MAIN_KEY_LIST.join(', ')}`,
			duration: 5000
		})
	}
}

// 检测存储数据大小是否超过 150KB (目前只检测 localStorage 中的缓存大小)
function notifyErrorWhenSizeExceed(storageKey: string, diskSize?: number) {
	if (process.env.NODE_ENV !== 'development') return

	const size = diskSize || getStorageSize(storageKey, localStorage.getItem(storageKey))
	if (size > MAX_STORAGE_SIZE) {
		ElMessage.error({
			message: `【AppCache】数据大小超过 ${MAX_STORAGE_SIZE / 1024}KB (size: ${(size / 1024).toFixed(0)}KB)，请检查数据: ${storageKey}，如果数据确实比较大，请考虑使用 indexedDB 存储 (storageType: 'indexedDB')`,
			duration: 5000
		})
	}
}

type ClearRange = AppCacheOptions['lifetime'] | 'all'

interface ClearPageCacheOptions {
	clearRange?: ClearRange
	/**
	 * 存储方案: 'local'（默认）, 'session', 'indexedDB', 'all'，决定清理 localStorage、sessionStorage 还是两者
	 */
	storageType?: StorageTypeRange
}

/** 获取清除页面缓存的 storageKey 的正则 */
function getClearPageCacheReg(pathname: string, options: ClearPageCacheOptions) {
	const { clearRange } = options
	let string = ''
	if (clearRange === 'all') {
		string = `${pathname}.*_(page|always)$`
	} else {
		string = `${pathname}.*_${clearRange}$`
	}
	return new RegExp(string)
}

// 清除 indexedDB 中符合正则的 key 对应的缓存
async function clearIndexedDBWithKeysReg(reg: RegExp) {
	const keys = await localforage.keys()
	const targetKeys = keys.filter((key) => reg.test(key))
	for (const targetKeysChunk of chunk(targetKeys, 10)) {
		await Promise.all(targetKeysChunk.map((key) => removeIndexedDBByName(key)))
	}
}

/**
 * 清除指定页面的指定范围的缓存
 * @param pathname 页面的 location.pathname
 * @param options.clearRange 默认: 'page',
 * 'page': 清除 lifetime 为 'page' 的缓存 (即页面 tag 被关闭就会被清除的缓存),
 * 'always': 清除 lifetime 为 'always' 的缓存 (即 关闭页面, 退出登录 也会存在的缓存),
 * 'all': 清除页面所有的缓存 (即该页面所有的缓存)
 * @param options.storageType 默认: 'local'，可选 'session', 'indexedDB' 或 'all'
 */
export function clearPageCache(pathname: string, options?: ClearPageCacheOptions) {
	const finalOptions: ClearPageCacheOptions = { clearRange: 'page', storageType: 'local', ...options }
	const reg = getClearPageCacheReg(pathname, finalOptions)
	return clearCacheByRegex(reg, finalOptions.storageType || 'local')
}

/**
 * 清除所有页面的指定范围的缓存
 * @param options.clearRange 默认: 'page',
 * 'page': 清除 lifetime 为 'page' 的缓存 (即页面 tag 被关闭就会被清除的缓存),
 * 'always': 清除 lifetime 为 'always' 的缓存 (即 关闭页面, 退出登录 也会存在的缓存),
 * 'all': 清除页面所有的缓存 (即该页面所有的缓存)
 * @param options.storageType 默认: 'local'，可选 'session', 'indexedDB' 或 'all'
 */
export function clearAllPageCache(options?: ClearPageCacheOptions) {
	const finalOptions: ClearPageCacheOptions = { clearRange: 'page', storageType: 'local', ...options }
	const reg = getClearPageCacheReg('', finalOptions)
	return clearCacheByRegex(reg, finalOptions.storageType || 'local')
}

// 根据正则，清除指定 storage 的缓存
function clearCacheByRegex(reg: RegExp, storageType: StorageTypeRange) {
	const clear = (storage: Storage, removeFn: (key: string) => void) => {
		const allStorageKeys = Object.keys(storage) || []
		for (const storageKey of allStorageKeys) {
			if (reg.test(storageKey)) {
				removeFn(storageKey)
			}
		}
	}

	switch (storageType) {
		case 'local':
			clear(localStorage, removeLocalStorageByName)
			break
		case 'session':
			clear(sessionStorage, removeSessionStorageByName)
			break
		case 'indexedDB':
			return clearIndexedDBWithKeysReg(reg)
		case 'all':
			clear(localStorage, removeLocalStorageByName)
			clear(sessionStorage, removeSessionStorageByName)
			return clearIndexedDBWithKeysReg(reg)
	}
}

interface RecordStorageInfoOptions {
	storageKey: string
	storageType: StorageType
	size?: number
}

// 记录 AppCache 的 localStorage 的 缓存信息 (最近使用时间，大小)
function recordStorageInfoForLocalStorage(options: Omit<RecordStorageInfoOptions, 'storageType'>) {
	const { storageKey, size } = options
	let allStorageInfo = getLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		allStorageInfo = initAllStorageInfoForLocalStorage()
	}
	allStorageInfo[storageKey] = { ...allStorageInfo[storageKey], lastTime: Date.now(), size }
	setLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
}

// 记录 AppCache 的 indexedDB 的 缓存信息 (最近使用时间)
async function recordStorageInfoForIndexedDB(options: Omit<RecordStorageInfoOptions, 'storageType' | 'size'>) {
	const { storageKey } = options
	let allStorageInfo = await getIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		allStorageInfo = await initAllStorageInfoForIndexedDB()
	}
	allStorageInfo[storageKey] = { ...allStorageInfo[storageKey], lastTime: Date.now() }
	await setIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
}

// 移除 AppCache 中的 localStorage 的 指定 storageKey 的缓存信息
function removeStorageInfoForLocalStorage(storageKey: string) {
	let allStorageInfo = getLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		allStorageInfo = initAllStorageInfoForLocalStorage()
	}
	setLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO, omit(allStorageInfo, storageKey))
}

// 移除 AppCache 中的 indexedDB 的 指定 storageKey 的缓存信息
async function removeStorageInfoForIndexedDB(storageKey: string) {
	let allStorageInfo = await getIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		allStorageInfo = await initAllStorageInfoForIndexedDB()
	}
	await setIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO, omit(allStorageInfo, storageKey))
}

// 每天检测是否存在时间超过 30 天的缓存，如果存在，则清除
export async function clearExpiredAppCacheEveryDay() {
	if (getLocalStorageByName(LAST_CLEAR_APP_CACHE_DATE) === dayjs().format('YYYY-MM-DD')) {
		return
	}

	await clearExpiredCacheByTime()
	setLocalStorageByName(LAST_CLEAR_APP_CACHE_DATE, dayjs().format('YYYY-MM-DD'))
}

// 根据最近使用时间，清除过期的缓存
async function clearExpiredCacheByTime() {
	clearExpiredCacheByTimeForLocalStorage()
	await clearExpiredCacheByTimeForIndexedDB()
}

// 获取 storage 的大小
export function getStorageSize(key: string, value: string | null) {
	return key.length + (value || '').length
}

// 根据最近使用时间，清除过期的缓存 - localStorage
function clearExpiredCacheByTimeForLocalStorage() {
	let allStorageInfo = getLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		initAllStorageInfoForLocalStorage()
		return
	} else {
		allStorageInfo = cleanRemovedStorageInfoForLocalStorage(allStorageInfo)
	}

	const thirtyDaysAgo = Date.now() - THIRTY_DAYS

	const expiredKeys = Object.keys(allStorageInfo).filter((key) => {
		return allStorageInfo[key].lastTime < thirtyDaysAgo
	})

	expiredKeys.forEach((key) => {
		removeLocalStorageByName(key)
	})

	allStorageInfo = omit(allStorageInfo, expiredKeys)
	setLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
}

// 初始化 localStorage 中的 AppCache 的缓存信息
function initAllStorageInfoForLocalStorage() {
	// 获取 localStorage 中所有的 key
	const allKeys = Object.keys(localStorage)
	const now = Date.now()
	// 获取所有 key 的最近使用时间
	const allStorageInfo = allKeys.reduce(
		(acc, key) => {
			if (!STORAGE_MAIN_KEY_REG.test(key)) return acc
			acc[key] = {
				lastTime: now,
				size: getStorageSize(key, localStorage.getItem(key))
			}
			return acc
		},
		{} as Record<string, StorageInfo>
	)
	setLocalStorageByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
	return allStorageInfo
}

// 清理 localStorage 中已经不存在的缓存的 缓存信息
function cleanRemovedStorageInfoForLocalStorage(allStorageInfo: Record<string, StorageInfo>) {
	const allKeys = Object.keys(localStorage)
	allStorageInfo = Object.keys(allStorageInfo).reduce(
		(acc, key) => {
			if (!allKeys.includes(key)) return acc
			acc[key] = allStorageInfo[key]
			return acc
		},
		{} as Record<string, StorageInfo>
	)
	return allStorageInfo
}

// 根据最近使用时间，清除过期的缓存 - indexedDB
async function clearExpiredCacheByTimeForIndexedDB() {
	let allStorageInfo = await getIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO)
	if (!allStorageInfo) {
		await initAllStorageInfoForIndexedDB()
		return
	} else {
		allStorageInfo = await cleanRemovedStorageInfoForIndexedDB(allStorageInfo)
	}

	const thirtyDaysAgo = Date.now() - THIRTY_DAYS

	const expiredKeys = Object.keys(allStorageInfo).filter((key) => {
		return allStorageInfo[key].lastTime < thirtyDaysAgo
	})

	for (const expiredKeysChunk of chunk(expiredKeys, 10)) {
		await Promise.all(expiredKeysChunk.map((key) => removeIndexedDBByName(key)))
	}

	allStorageInfo = omit(allStorageInfo, expiredKeys)
	await setIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
}

// 初始化 indexedDB 中的 AppCache 的缓存信息
async function initAllStorageInfoForIndexedDB() {
	// 获取 indexedDB 中所有的 key
	const allKeys = await localforage.keys()
	const now = Date.now()
	// 获取所有 key 的最近使用时间
	const allStorageInfo = allKeys.reduce(
		(acc, key) => {
			if (!STORAGE_MAIN_KEY_REG.test(key)) return acc
			acc[key] = {
				lastTime: now
			}
			return acc
		},
		{} as Record<string, StorageInfo>
	)
	await setIndexedDBByName(APP_CACHE_ALL_STORAGE_INFO, allStorageInfo)
	return allStorageInfo
}

// 清理 indexedDB 中已经不存在的缓存的 缓存信息
async function cleanRemovedStorageInfoForIndexedDB(allStorageInfo: Record<string, StorageInfo>) {
	const allKeys = await localforage.keys()
	allStorageInfo = Object.keys(allStorageInfo).reduce(
		(acc, key) => {
			if (!allKeys.includes(key)) return acc
			acc[key] = allStorageInfo[key]
			return acc
		},
		{} as Record<string, StorageInfo>
	)
	return allStorageInfo
}
