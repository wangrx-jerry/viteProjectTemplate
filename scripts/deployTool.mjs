import axios from 'axios'
import { execSync } from 'child_process'

const MAP_SERVER_ADDRESS = {
	dev: '172.16.1.153',
	test: '172.16.1.158',
	test2: '172.16.1.154',
	uat: '172.16.1.155'
}

export const PROJECT_DIRECTORY = '/home/work/elink-client/web/'
export const PROJECT_PARENT_DIRECTORY = '/home/work/elink-client/'

const getServerAddress = (environment) => {
	if (!MAP_SERVER_ADDRESS[environment]) return undefined
	return MAP_SERVER_ADDRESS[environment]
}

export const logError = (message) => console.log('\x1B[31m%s\x1B[0m', message)

export function getDeployParams() {
	const params = process.argv.slice(2).reduce((acc, cur) => {
		if (cur.startsWith('--')) {
			const [key, value] = cur.slice(2).split('=')
			acc[key] = value
		}
		return acc
	}, {})

	const serverAddress = getServerAddress(params.environment)

	if (!params.environment) {
		logError('[error] environment 参数为空')
		process.exit(0)
	}

	if (!serverAddress) {
		logError(`[error] 指定的 environment: ${params.environment} 对应的服务器地址未配置`)
		process.exit(0)
	}

	const serverUser = params.serverUser || 'root'
	const devBranch = params.branch || execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

	return { environment: params.environment, serverAddress, serverUser, devBranch }
}

export function executeCommand({ cmd, message, options = { stdio: 'ignore', shell: true } }) {
	return new Promise((resolve, reject) => {
		try {
			console.log(message)
			const output = execSync(cmd, options)
			resolve(output)
		} catch (error) {
			reject(new Error(`命令执行失败: ${cmd}\n${error.message}`))
		}
	})
}

/**
 * 获取远程服务器磁盘剩余空间
 * @param {string} serverUser - 服务器用户名
 * @param {string} serverAddress - 服务器地址
 * @returns {number} 磁盘剩余空间（MB）
 */
export function getRemoteDiskSpace(serverUser, serverAddress) {
	const cmd = `ssh ${serverUser}@${serverAddress} df -m /`
	const output = execSync(cmd, { encoding: 'utf-8' })
	const outputLines = output.split('\n')
	const diskInfoLine = outputLines.find((line) => line.trim().startsWith('/'))

	if (!diskInfoLine) {
		throw new Error('获取服务器磁盘信息失败')
	}

	const [_, _total, _used, avail, _percent, _mount] = diskInfoLine.split(/\s+/)
	return Number(avail || 0)
}

// 发送企微群消息
export function notifyWeWorkGroupMessage(msgtype, data, robotKey) {
	robotKey = robotKey || 'd87f2330-7542-43c6-829c-1c40f297c03f' // 企微研发测试群

	return axios
		.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${robotKey}`, {
			msgtype,
			[msgtype]: data
		})
		.then((res) => {
			if (res.data.errcode !== 0) {
				console.error('企业微信推送失败：', res.data)
			}
		})
		.catch((err) => {
			console.error('企业微信推送失败', err)
		})
}
