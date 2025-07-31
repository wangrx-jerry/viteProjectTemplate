/* eslint-disable import/extensions */
import axios from 'axios'
import { execSync } from 'child_process'
import dayjs from 'dayjs'

const environment = process.argv.slice(-1)[0]
const project = '紫涵PC'
const deployTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
const branch = execSync('git rev-parse --abbrev-ref HEAD', {
	encoding: 'utf8'
})
const userName = execSync('git config --global --get user.name', {
	encoding: 'utf8'
})

const content = `# 前端发布提醒\n项目：${project}\n发布环境：<font color=\"warning\">${environment}</font>\n发布人：${userName.trim()}\n发布分支：${branch.trim()}\n操作时间：${deployTime}\n`
axios
	.post('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=d87f2330-7542-43c6-829c-1c40f297c03f', {
		msgtype: 'markdown',
		markdown: {
			content
		}
	})
	.then((res) => {
		if (res.data.errcode === 0) {
			console.log('企业微信推送成功')
		} else {
			console.log('企业微信推送失败：', res.data)
		}
	})
	.catch((error) => {
		console.log('企业微信推送失败')
	})
