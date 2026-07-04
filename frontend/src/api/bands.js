// api/bands.js：封装"跟乐队相关"的所有请求函数
// 组件里只需要 import { getFeaturedBands } from '../api/bands.js'，然后调用它，
// 不需要关心 axios、网址路径这些细节，这就是"封装"的意义
import { api } from './client.js'

// 获取首页轮播图要展示的乐队（isFeatured 为 true 的那些）
export async function getFeaturedBands() {
  const res = await api.get('/bands', { params: { featured: 'true' } })
  return res.data
}

// 获取全部乐队列表
export async function getAllBands() {
  const res = await api.get('/bands')
  return res.data
}

// 获取单个乐队详情
export async function getBandById(id) {
  const res = await api.get(`/bands/${id}`)
  return res.data
}

// --- 以下三个函数需要登录后才能调用（后端已用 requireAuth 中间件保护） ---

// 新增一个乐队
export async function createBand(data) {
  const res = await api.post('/bands', data)
  return res.data
}

// 更新一个已存在的乐队
export async function updateBand(id, data) {
  const res = await api.put(`/bands/${id}`, data)
  return res.data
}

// 删除一个乐队
export async function deleteBand(id) {
  const res = await api.delete(`/bands/${id}`)
  return res.data
}
