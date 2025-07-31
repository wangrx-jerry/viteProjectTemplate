import { execSync, spawnSync } from 'child_process'

let branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
if (branch === 'HEAD') {
	branch = execSync('echo $GIT_BRANCH', { encoding: 'utf8' }).trim()
}
const envCmd = process.platform === 'win32' ? 'set' : 'export'
const envVar = `${envCmd} VITE_APP_BRANCH=${branch}`

spawnSync(`${envVar}&& npx vite --host 0.0.0.0`, {
	stdio: 'inherit',
	shell: true
})
