/* eslint-disable import/extensions */
import { execFile, execSync } from 'child_process'

import {
	executeCommand,
	getDeployParams,
	getRemoteDiskSpace,
	logError,
	notifyWeWorkGroupMessage,
	PROJECT_DIRECTORY,
	PROJECT_PARENT_DIRECTORY
} from './deployTool.mjs'

const { environment, serverAddress, serverUser } = getDeployParams()

const PROJECT_DIRECTORY_BACKUP = `${PROJECT_DIRECTORY.slice(0, -1)}_backup`

let branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
if (branch === 'HEAD') {
	branch = execSync('echo $GIT_BRANCH', { encoding: 'utf8' }).trim()
}

const commandsToExecute = [
	{
		title: '本地打包',
		cmd: `npm run build --target_server=${environment} --branch=${branch}`,
		message: `开始打包，环境: ${environment}，服务器目录: ${serverAddress}:${PROJECT_DIRECTORY} \n`,
		options: { stdio: 'inherit', shell: true }
	},
	{
		title: '本地压缩文件',
		cmd: `tar -zcvf elink_client.tar.gz -C ./dist .`,
		message: `正在压缩 dist 目录... \n`
	},
	{
		title: '本地传送压缩文件',
		cmd: `scp -r elink_client.tar.gz ${serverUser}@${serverAddress}:${PROJECT_PARENT_DIRECTORY}`,
		message: `开始将压缩文件传送到${environment}服务器中的${PROJECT_PARENT_DIRECTORY}目录 ... \n`
	},
	{
		title: '删除本地压缩文件',
		cmd: process.platform === 'win32' ? `del elink_client.tar.gz` : `rm -rf elink_client.tar.gz`,
		message: `上传完成，正在删除本地压缩文件... \n`
	},
	{
		title: '服务器解压缩文件1',
		cmd: `ssh ${serverUser}@${serverAddress} "mkdir -p ${PROJECT_DIRECTORY_BACKUP} && tar -zxvf ${PROJECT_PARENT_DIRECTORY}elink_client.tar.gz -C ${PROJECT_DIRECTORY_BACKUP}"`,
		message: `正在解压缩${environment}服务器中的压缩文件到${PROJECT_DIRECTORY_BACKUP}目录 (如果目录不存在，则会先创建目录)... \n`
	},
	{
		title: '服务器删除原应用目录',
		cmd: `ssh ${serverUser}@${serverAddress} rm -rf ${PROJECT_DIRECTORY}`,
		message: `正在删除${environment}服务器中的原应用目录... \n`
	},
	{
		title: '服务器backup应用目录重命名为应用目录',
		cmd: `ssh ${serverUser}@${serverAddress} mv ${PROJECT_DIRECTORY_BACKUP} ${PROJECT_DIRECTORY}`,
		message: `正在将服务器中的 ${PROJECT_DIRECTORY_BACKUP} 目录重命名为 ${PROJECT_DIRECTORY}... \n`
	},
	{
		title: '服务器解压缩文件2', // 这个解压是为了占据项目文件需要的磁盘空间，防止部署时磁盘空间不足
		cmd: `ssh ${serverUser}@${serverAddress} "mkdir -p ${PROJECT_DIRECTORY_BACKUP} && tar -zxvf ${PROJECT_PARENT_DIRECTORY}elink_client.tar.gz -C ${PROJECT_DIRECTORY_BACKUP}"`,
		message: `正在解压缩${environment}服务器中的压缩文件到${PROJECT_DIRECTORY_BACKUP}目录 (如果目录不存在，则会先创建目录) (占位用，防止磁盘空间不足)... \n`
	}
]

let initialDiskSpace = 0
function checkDiskSpace() {
	try {
		// 获取服务器磁盘剩余空间
		initialDiskSpace = getRemoteDiskSpace(serverUser, serverAddress)
		console.log(`服务器 (${serverAddress}) 磁盘剩余空间：${initialDiskSpace}MB`)
		if (initialDiskSpace < 500) {
			notifyWeWorkGroupMessage('markdown', {
				content: `# 服务器空间不足  \n服务器 (${serverAddress}) 磁盘剩余空间不足500MB (当前剩余空间：<font color=\"warning\">${initialDiskSpace}MB</font>)，请及时清理磁盘空间，磁盘空间不足将导致前端部署失败\n<@177115468><@120339349><@174948626>`
			})
		}
	} catch {
		console.error('获取服务器磁盘剩余空间失败')
	}
}

async function executeCommands({ isScp = false } = {}) {
	const commands = isScp ? commandsToExecute.slice(1) : commandsToExecute
	for (const command of commands) {
		try {
			await executeCommand(command)
		} catch (error) {
			console.error(`执行过程中发生错误: ${error} \n`)
			console.error(`执行的命令: ${command.title} - ${command.cmd} \n`)

			const currentDiskSpace = getRemoteDiskSpace(serverUser, serverAddress)

			// 传送压缩文件、服务器解压缩文件1 失败
			// 且磁盘空间不足500MB，则通知；否则 本地 log
			if (['传送压缩文件', '服务器解压缩文件1'].includes(command.title)) {
				if (currentDiskSpace < 500) {
					notifyWeWorkGroupMessage('markdown', {
						content: `# 前端部署失败  \n服务器 (${serverAddress}) 当前剩余空间：<font color=\"warning\">${currentDiskSpace}MB</font>，请及时清理磁盘空间\n<@177115468><@120339349><@174948626>`
					})
				} else {
					logError('前端部署失败，磁盘空间充足')
				}
			}
			// 服务器解压缩文件2 (备份项目文件目录，这个失败了不会影响这次的部署，但下一次部署时大概率会失败)
			else if (command.title === '服务器解压缩文件2') {
				// 如果初始磁盘空间大于500MB，并且当前磁盘空间小于500MB，然后 服务器解压缩文件2 执行出错，则通知
				if (initialDiskSpace >= 500 && currentDiskSpace < 500) {
					notifyWeWorkGroupMessage('markdown', {
						content: `# 服务器空间不足  \n服务器 (${serverAddress}) 当前剩余空间：<font color=\"warning\">${currentDiskSpace}MB</font>，请及时清理磁盘空间\n<@177115468><@120339349><@174948626>`
					})
				}
			}

			throw new Error('部署失败')
		}
	}
}

function notifyDeploySuccess() {
	execFile('node', ['./scripts/notice.mjs', environment], (error, stdout, stderr) => {
		if (error) {
			console.error('推送提醒失败:', error)
		} else {
			console.log('推送提醒: ' + stdout)
		}
	})
}

export async function deploy() {
	console.time('deploy 执行时长')
	try {
		checkDiskSpace()
		await executeCommands()
		notifyDeploySuccess()
	} finally {
		console.timeEnd('deploy 执行时长')
	}
}

export async function scp() {
	console.time('scp 执行时长')
	try {
		checkDiskSpace()
		await executeCommands({ isScp: true })
		notifyDeploySuccess()
	} finally {
		console.timeEnd('scp 执行时长')
	}
}
