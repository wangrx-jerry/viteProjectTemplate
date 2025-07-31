import { spawnSync } from 'child_process'

const envCmd = process.platform === 'win32' ? 'set' : 'export'

const envVar = `${envCmd} VITE_APP_BRANCH=${process.env.npm_config_branch || 'test'}`

spawnSync(`${envVar}&& node --max_old_space_size=8192 node_modules/vite/bin/vite.js build`, {
	stdio: 'inherit',
	shell: true
})
