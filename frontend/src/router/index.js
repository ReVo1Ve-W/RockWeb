// router/index.js：定义"网址路径"和"页面组件"之间的对应关系
// 这是 Vue Router 的核心配置文件——有了它，App.vue 就能在不同页面之间切换，
// 而不需要真的从服务器重新加载整个网站（这叫"单页应用" SPA，切换页面体验更流畅）
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import BandDetail from '../views/BandDetail.vue'
import BandList from '../views/BandList.vue'
import AlbumList from '../views/AlbumList.vue'

import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminBandList from '../views/admin/AdminBandList.vue'
import AdminBandForm from '../views/admin/AdminBandForm.vue'
import AdminAlbumList from '../views/admin/AdminAlbumList.vue'
import AdminAlbumForm from '../views/admin/AdminAlbumForm.vue'

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
  {
    // 登录页单独一条路由，不套在 AdminLayout 里面
    // （登录页不需要侧边栏和退出登录按钮，未登录时也应该能访问这一页）
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin,
  },
  {
    // AdminLayout 作为"父路由"，它的 <router-view> 会渲染下面这些子路由，
    // 子路由的 path 会自动拼接在父路由 path 后面
    // （例如 admin-bands 的实际访问路径是 /admin/bands）
    path: '/admin',
    component: AdminLayout,
    // meta.requiresAuth 是自定义标记，不是 Vue Router 内置字段，
    // 专门配合下面的全局前置守卫使用：标记"这个路由需要登录才能访问"
    meta: { requiresAuth: true },
    children: [
      { path: 'bands', name: 'admin-bands', component: AdminBandList },
      { path: 'bands/new', name: 'admin-band-new', component: AdminBandForm },
      { path: 'bands/:id/edit', name: 'admin-band-edit', component: AdminBandForm },
      { path: 'albums', name: 'admin-albums', component: AdminAlbumList },
      { path: 'albums/new', name: 'admin-album-new', component: AdminAlbumForm },
      { path: 'albums/:id/edit', name: 'admin-album-edit', component: AdminAlbumForm },
    ],
  },
]

export const router = createRouter({
  // createWebHistory 让网址看起来是正常的路径（如 /bands/xxx），
  // 而不是带 # 号的旧式写法（如 /#/bands/xxx）
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// 全局前置守卫（beforeEach）：每次路由跳转之前都会先经过这个函数检查一遍。
// 这里做的事：如果目标页面要求登录（meta.requiresAuth）、但本地没存 token，
// 就把这次跳转"重定向"到登录页，而不是真的跳转到目标页面
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isLoggedIn = !!localStorage.getItem('admin_token')

  if (requiresAuth && !isLoggedIn) {
    return { name: 'admin-login' }
  }
})
