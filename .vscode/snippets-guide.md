# 代码片段(Snippets)使用指南

## 简介

本项目包含多种代码片段(Snippets)，为提高开发效率而设计。这些代码片段可以帮助您快速生成常用的代码模板，避免重复工作。

## 可用的代码片段类型

本项目中包含以下类型的代码片段：

- **Vue 相关代码片段**: 用于 Vue 组件开发
- **HTML 相关代码片段**: 用于 HTML 文件编写
- **JavaScript 相关代码片段**: 用于 JS 文件编写
- **JSX 相关代码片段**: 用于 JSX 语法使用

## Vue 代码片段

Vue 代码片段主要存放在 `.vscode/xx-snippets` 文件中，分为以下几类：

### 基础组件代码片段

| 前缀 | 描述 | 用途 |
|------|------|------|
| `!vue` | Vue 组件基础结构 | 创建一个标准的 Vue 选项式组件结构 |
| `!zs` | Vue 文件注释 | 添加 Vue 文件的注释头部 |

### 布局组件代码片段

| 前缀 | 描述 | 用途 |
|------|------|------|
| `!layOutBlock` | 布局块组件 | 创建一个带有头部和内容的布局块 |

### 表格组件代码片段

| 前缀 | 描述 | 用途 |
|------|------|------|
| `!tablePage` | 表格页面组件 | 创建一个带有 YLTable 的表格页面组件 |

### 条件渲染代码片段

| 前缀 | 描述 | 用途 |
|------|------|------|
| `if` | v-if 条件 | 添加带有 v-if 的模板 |
| `else` | v-else 条件 | 添加带有 v-else 的模板 |

### 工具代码片段

| 前缀 | 描述 | 用途 |
|------|------|------|
| `cl` | 从剪贴板打印到控制台 | 从剪贴板内容创建 console.log 语句 |

## 使用方法

1. 在 VS Code 中打开一个 Vue 文件
2. 输入相应的前缀（如 `!vue`）
3. 按下 Tab 键，代码片段会自动展开
4. 使用 Tab 键在各个占位符之间跳转并填写内容

## 示例

### 创建一个基础 Vue 组件

在 `.vue` 文件中输入 `!vue` 并按 Tab 键，会展开为：

```vue
<!--
* @Description: [这里填写描述]
* @Author: wrx
* @LastEditors: wrx
-->
<template>
[这里填写模板内容]
</template>
<script>
export default {
name: [这里填写组件名称]
data () {
return {}
},
}
</script>
<style scoped lang='scss'>
</style>
```

### 创建一个表格页面

在 `.vue` 文件中输入 `!tablePage` 并按 Tab 键，会展开为带有完整表格功能的组件结构。

### 添加条件渲染

输入 `if` 并按 Tab 键，会展开为：
```vue
<template v-if=[条件]>[内容]</template>
```

## 自定义代码片段

如果您需要添加自己的代码片段，可以按照以下步骤操作：

1. 打开 VS Code 的命令面板 (Ctrl+Shift+P 或 Cmd+Shift+P)
2. 输入 "Snippets"，选择 "Preferences: Configure User Snippets"
3. 选择 "vue.code-snippets" 文件
4. 按照现有格式添加您的代码片段

代码片段的基本格式如下：

```json
"片段名称": {
  "prefix": "触发前缀",
  "body": [
    "第一行代码",
    "第二行代码",
    "..."
  ],
  "description": "片段描述"
}
```

## 代码片段存放位置

项目中的代码片段文件存放在以下位置：

- `.vscode/vue.code-snippets`: Vue 相关代码片段
- `.vscode/html.code-snippets`: HTML 相关代码片段
- `.vscode/js.code-snippets`: JavaScript 相关代码片段
- `.vscode/jsx.code-snippets`: JSX 相关代码片段