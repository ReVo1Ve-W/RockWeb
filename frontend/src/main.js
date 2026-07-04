import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router/index.js'

// .use(router) 把路由功能"安装"进整个 Vue 应用，
// 之后任何组件里都能用 useRoute() / useRouter()，<router-view> 也才能正常工作
createApp(App).use(router).mount('#app')
