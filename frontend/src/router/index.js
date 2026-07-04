// router/index.js：定义"网址路径"和"页面组件"之间的对应关系
// 这是 Vue Router 的核心配置文件——有了它，App.vue 就能在不同页面之间切换，
// 而不需要真的从服务器重新加载整个网站（这叫"单页应用" SPA，切换页面体验更流畅）
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import BandDetail from '../views/BandDetail.vue'
import BandList from '../views/BandList.vue'
import AlbumList from '../views/AlbumList.vue'

const routes = [
  {
    path: '/', // 访问根路径时
    name: 'home',
    component: Home, // 渲染 Home.vue（也就是原来 App.vue 里的首页内容）
  },
  {
    path: '/bands', // 顶部导航"乐队"对应的全部乐队列表页
    name: 'band-list',
    component: BandList,
  },
  {
    // :id 是"动态路由参数"，比如访问 /bands/64f1a2b3 时，
    // 组件内部可以通过 route.params.id 拿到这个 "64f1a2b3"
    path: '/bands/:id',
    name: 'band-detail',
    component: BandDetail,
  },
  {
    path: '/albums', // 顶部导航"专辑"对应的全部专辑列表页
    name: 'album-list',
    component: AlbumList,
  },
]

export const router = createRouter({
  // createWebHistory 让网址看起来是正常的路径（如 /bands/xxx），
  // 而不是带 # 号的旧式写法（如 /#/bands/xxx）
  history: createWebHistory(),
  routes,
})
