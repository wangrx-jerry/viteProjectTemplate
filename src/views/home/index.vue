<template>
	<div>
		<h1>Home{{ a }}</h1>
		<h1>module1State{{ module1State }}</h1>
		<h1>module2State{{ module2State }}</h1>
		<el-button @click="updateState">更新 state</el-button>
	</div>
</template>

<script setup lang="ts">
// ref、computed、useStore 已自动导入
const a = ref('1')

// ✅ 在 setup 阶段获取 store 实例
const store = useStore()

const module1State = computed(() => store?.state.module1.module1State)
const module2State = computed(() => store?.state.module2.module2State)

const updateState = () => {
	// ✅ 使用在 setup 阶段获取的 store 实例
	store?.dispatch('module1/updateState')
	store?.dispatch('module2/updateState')
}
</script>

<style scoped lang="scss">
/* 组件样式 */
</style>
