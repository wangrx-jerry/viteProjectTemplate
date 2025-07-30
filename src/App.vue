<script setup lang="ts"></script>

<template>
	<RouterLink tag="button" to="/module1/somePage/index">Module1</RouterLink>
	<RouterLink tag="button" to="/module2/somePage/index">Module2</RouterLink>
	<RouterLink tag="button" to="/module1/somePage/Public">Module1Public</RouterLink>
	<router-view />
</template>

<style scoped></style>
