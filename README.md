## 项目说明

vue3 + ts + vite 客户端项目（可作为 vue3 项目模板）

## 页面缓存

### 前置条件

1. router.name 一定要填写不然使用<keep-alive>时会出现各种问题
2. router.name 等于 component.name：路由的 name 和组件 name 需要一致

### 使用说明

默认会将所有页面进行缓存，如果页面不需要缓存，可通过 router.meta.noCache = true 进行设置，常见的不需要缓存的页面有：

1. 预览组件，例如：permissionConfig/user/DetailView
2. 使用了 teleport 插入到父组件，例如：PermissionConfigCom.vue

需要缓存的页面需要保证 route.name 和 组件的 name 一致

### 更新缓存

什么时候需要手动更新缓存:
需要指定页面重载

更新方法：<br>
通过更新 tagsView.state.cachedViews，方法：

```js
this.$store.dispatch('tagsView/delVisitedView', routeObj).then(() => {
	this.$router.replace({ name: 'UsesPermission' })
})
```

注意：routeObj 至少包含 name 信息·

### tagsView

默认标签栏的唯一标识是 fullpath，这也就意味着：如果相同 path 对应的 query 不同，会打开不同的标签页：

```
/someDetail?id=1
```

和

```
/someDetail?id=2
```

将会对应不同 tag，如果想要忽略对 query 的判断，可以在路由信息中通过指定 tag 的 key 作为唯一标识：

```js
{
		path: 'resourceAudit/Detail',
		name: 'SupplierResourceDetail',
		component: async () => await import('@/views/suppliersManage/resourceAudit/Detail.vue'),
		meta: {
			title: '入驻审核-审核详情',
			group: '供应商管理',
			role: '入驻管理',
			key: 'path'
		}
	}
```

## 指令

### transformView

作用：查看模式下，页面展现方式为文本展示

```js
<el-input v-transformView:disabled="!editable" v-model="pageData.accountName" placeholder="请输入" clearable maxlength="30"></el-input>
```

注意：使用这个指令的页面需要先将页面隐藏（v-if），当页面数据准备完成后再显示

[prettier](https://prettier.io/docs/en/options.html)
eslint 风格：standard

### 文件夹结构

全局资源管理：views 同级文件夹中集中管理，例如：src/api 文件管理的是系统通用 api，src/components 管理的是系统全局组件

系统模块(xxManagement)下存放具体业务页面（通常路由配置指向的页面），组件统一交 components 管理，api、hook...在当前业务文件夹下集中管理，例如：

```
xxManage(模块)
├── someBusiness（业务）
│   ├── List.vue
│   ├── Detail.vue
│   ├── api
│   ├── components
│   ├── hook
│   └── mixin
│   └── ....
```

## 动态 title

可以通过在 router.query 中设置 title，例如：

```js
this.$router.push({ name: 'xx', query: { title: '被打开的页面title' } })
```

2. 依赖资源（routes、vuex...）通过脚步[自动引入](https://blog.csdn.net/weixin_43191327/article/details/123982521)

### git commit

采用 Angular 团队的提交规范，commit message 由 Header、Body、Footer 组成。

**header**

Header 部分包括三个字段 type（必需）、scope（可选）和 subject（必需）。

```sass
<type>(<scope>): <subject>
```

**type**
| 值 | 描述 |
| --- | --- |
| feat | 新增一个功能 |
| fix | 修复一个 Bug |
| docs | 文档变更 |
| style | 代码格式（不影响功能，例如空格、分号等格式修正） |
| refactor | 代码重构 |
| perf | 改善性能 |
| test | 测试 |
| build | 变更项目构建或外部依赖（例如 scopes: webpack、gulp、npm 等） |
| ci | 更改持续集成软件的配置文件和 package 中的 scripts 命令，例如 scopes: Travis, Circle 等 |
| chore | 变更构建流程或辅助工具 |
| revert | 代码回退 |

### 每期的分支管理

默认是基于 dev 分支切一个自己的开发分支，对本期的需求进行开发，如果预估某个任务可能存在上线发现，对这个任务单独切一个分支，方便后期对这部分任务做单独上线

### bug 修复的相关分支操作

例如测试环境有一个 bug

如果本地有更改（没有则忽略此步骤），通过 git stash 先暂存本地修改：

```
git stash save '本地暂存的说明信息'
```

-> 再切换到测试分支（release 分支），基于测试分支切一个 bugfix 分支，修改好 bug 之后再推送到测试分支：

```
git checkout release
-> git pull
-> git checkout -b issue-101
-> git commit -a -m '修复了xxbug'
-> git push
-> 到gitlab 上合并 ｜ 切到release 分支上 cherry-pick & push
```

-> 切到 dev 分支，通过 cherry-pick 操作将刚才的那次修复 bug 的提交应用到 dev 上：

```
查看release 的提交记录，copy刚才那次bug修复的提交hash ID，例如（12345）
-> git checkout dev
-> git cherry-pick <commit>，例如 git cherry-pick 12345
-> git push
```

-> 切回到自己的开发分支，rebase ｜ pull 最新的 dev 代码，再将之前暂存的代码提取出来：

```
git checkout wrx
-> git rebase dev
-> git stash pop
```

## 常见问题 & 解决方案

VxeTable 行编辑和 Element-UI el-select 和 el-autocomplete 的 select 事件冲突的问题
解决方式 1： 将 popper-append-to-body 属性改为 false 即可
解决方式 2（待验证）: 行编辑与第三方组件弹出层事件冲突时可以给弹出层加个 class="vxe-table--ignore-clear"就好了，文档里高级用法（事件拦截）

## TODO

1. 一些老的页面不是通过 ts 开发的，导致无法通过 ts 校验，后期需要对这些页面进行升级，页面升级完成之后，将 package.json build 脚步改为：

```
	"build": "vue-tsc --noEmit && vite build",
```

[打包文件的体积优化](https://segmentfault.com/a/1190000041464140?sort=newest)

2. 重写 push 方法，push 方法主动清空缓存

## 发布脚本用法

### 1. 切换分支后发布

-  发布 test2：
```bash
npm run deploy-test2
```
- 发布 test：
```bash
npm run deploy-test
```

### 2. 无需切换分支发布

- 将当前开发分支合并后到 dev 后发布：
```bash
npm run deploy-test2-nocheckout
```
- 将当前开发分支合并后到 test 后发布：
```bash
npm run deploy-test-nocheckout
```

### 3. 指定开发分支发布

- 将目标开发分支合并到主分支后发布：
```bash
npm run deploy-test2-nocheckout -- --branch=${your-dev-branch}
```
```bash
npm run deploy-test-nocheckout -- --branch=${your-dev-branch}
```


