<template>
	<div>
		<h1>Home{{ a }}</h1>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const a = ref('1')

console.log('auto import', isEmpty(a.value))
</script>

<style scoped lang="scss"></style>
