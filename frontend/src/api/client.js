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

