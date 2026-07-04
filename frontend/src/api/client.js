// api/client.js：统一配置的 axios 实例
// 把"后端服务地址"这类配置集中在一处，其他文件直接导入这个 api 对象来发请求，
// 不用每次都写一遍完整的地址
import axios from 'axios'

// import.meta.env.VITE_API_BASE_URL 是 Vite 提供的"环境变量"读取方式。
// 本地开发时，Vite 会自动读取项目根目录的 .env 文件；
// 部署到 Vercel 时，会读取在 Vercel 后台配置的同名环境变量。
// 这样"后端地址是 localhost 还是线上域名"就不用写死在代码里，
// 换环境只需要改配置，不用改代码、不用重新写一遍
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
})

// --- 请求拦截器：每次发请求前自动检查，如果本地存了登录凭证(token)，
// 就自动加到请求头里，不用每个 API 函数都手写一遍 ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- 响应拦截器：如果后端返回 401（token 无效或过期），
// 自动清掉本地存的 token 并跳转回登录页，不用每个页面自己写这段判断逻辑 ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      // 避免在非管理页面（比如普通访客浏览网站时）也被误触发跳转，
      // 只有当前正处于 /admin 路径下才跳转登录页
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

