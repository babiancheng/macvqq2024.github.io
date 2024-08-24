import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Elementplus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)

app.use(createPinia())
app.use(Elementplus)

app.mount('#app')


// 首先构造假数据, 渲染到页面