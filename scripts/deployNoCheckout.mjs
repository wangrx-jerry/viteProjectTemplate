// eslint-disable-next-line @typescript-eslint/no-var-requires
import { execSync } from 'child_process'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { getDeployParams } from './deployTool.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const { environment, devBranch } = getDeployParams()
const PARENT_DIR = path.resolve(__dirname, '../../')

const SUB_PROJECT_DIR = path.resolve(PARENT_DIR, 'temp/elink-client')
const SUB_PROJECT_GIT = 'git@121.41.7.207:elink/elink_client.git'
const ENV_BRANCH_MAP = {
	test2: 'dev',
	test: 'test'
}

const TARGET_BRANCH = ENV_BRANCH_MAP[environment]
console.log('devBranch>>>', devBranch)

function run(cmd, opts = {}) {
	console.log(`\n> ${cmd}`)
	try {
		execSync(cmd, { stdio: 'inherit', ...opts })
	} catch {
		console.error(`命令执行失败: ${cmd}`)
		process.exit(1)
	}
}

function main() {
	// 1. 切换到目标分支
	run(`git checkout ${TARGET_BRANCH}`)
	// 2. 同步远端目标分支
	run('git pull')
	// 3. 合并本地开发分支
	run(`git merge ${devBranch}`)
	// 4. 推送远端目标分支
	run(`git push origin ${TARGET_BRANCH}`)
	// 5. 回到开发分支
	run(`git checkout ${devBranch}`)
	// 6. 切换到副项目目录
	if (!fs.existsSync(SUB_PROJECT_DIR)) {
		const TEMP_DIR = path.resolve(PARENT_DIR, 'temp')
		if (!fs.existsSync(TEMP_DIR)) {
			console.log('temp 目录不存在，正在创建...')
			fs.mkdirSync(TEMP_DIR, { recursive: true })
		}
		console.log('副项目目录不存在，正在 clone...')
		run(`git clone ${SUB_PROJECT_GIT} elink-client`, { cwd: TEMP_DIR })
		run('npm i', { cwd: SUB_PROJECT_DIR })
	} else {
		console.log('副项目目录已存在')
		// 切换分支前清理本地所有变更，防止 install 带来额外变更
		run('git reset --hard', { cwd: SUB_PROJECT_DIR })
		run('git clean -fd', { cwd: SUB_PROJECT_DIR })
	}
	// 8. 副项目目标分支部署
	run(`git checkout ${TARGET_BRANCH}`, { cwd: SUB_PROJECT_DIR })
	run(`git fetch -a`, { cwd: SUB_PROJECT_DIR })
	run(`git reset --hard origin/${TARGET_BRANCH}`, { cwd: SUB_PROJECT_DIR })
	run('npm i', { cwd: SUB_PROJECT_DIR })
	run(`npm run deploy-${environment}`, { cwd: SUB_PROJECT_DIR })
	console.log(`\n✅ ${environment} 环境发布完成！`)
}

main()
