<template>
  <div class="app">
    <!-- v-model 可以获取数据, 并且可以在数据更改后重新进行提交并更新原数据 -->
    <Editor v-model="state" />
  </div>
</template>

<script setup lang='ts'>
import { provide, ref } from 'vue'
import data from './data.json'
import Editor from './packages/editor'
import {registerConfig } from './utils/editor-config'

const state = ref(data)
provide('register', registerConfig) // 注册全局配置
</script>

<style>
.app{
  position: relative;
  box-sizing: border-box;
}
</style>