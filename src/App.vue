<script setup lang="ts"></script>

<template>
	<div class="app">
		<RouterLink to="/">Go to Home</RouterLink>
		<RouterLink to="/module1/somePage/index">Module1</RouterLink>
		<RouterLink to="/module2/somePage/index">module2</RouterLink>
		<RouterView v-slot="{ Component }" class="router-view">
			<component :is="Component" />
		</RouterView>
	</div>
</template>

<style scoped>
.app {
	padding: 20px;
	background-color: #f0f2f5;
}

a {
	padding: 4px 8px;
	margin-right: 10px;
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	text-decoration: none;
	cursor: pointer;
	background-color: #409eff;
	border-radius: 4px;
	transition: color 0.3s;

	&:hover {
		color: #66b1ff;
	}
}

.router-view {
	padding: 10px;
	background-color: #fff;
	border-radius: 4px;
}
</style>
