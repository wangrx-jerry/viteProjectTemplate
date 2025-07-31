<script setup lang="ts"></script>

<template>
	<el-button type="primary" size="default" @click="">11</el-button>

	<RouterLink tag="button" to="/module2/somePage/index">Module2</RouterLink>
	<RouterLink tag="button" to="/module1/somePage/Public">Module1Public</RouterLink>
	<router-view />
</template>

<style scoped></style>
