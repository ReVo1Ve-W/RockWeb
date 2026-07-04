// api/albums.js：封装"跟专辑相关"的请求函数
import { api } from './client.js'

// 获取某个乐队的所有专辑，bandId 对应数据库里 Band 文档的 _id
export async function getAlbumsByBand(bandId) {
  const res = await api.get('/albums', { params: { band: bandId } })
  return res.data
}

// 获取全部专辑（不筛选乐队），用于"专辑"列表页
export async function getAllAlbums() {
  const res = await api.get('/albums')
  return res.data
}

// 获取单个专辑详情
export async function getAlbumById(id) {
  const res = await api.get(`/albums/${id}`)
  return res.data
}

// --- 以下三个函数需要登录后才能调用（后端已用 requireAuth 中间件保护） ---

// 新增一个专辑
export async function createAlbum(data) {
  const res = await api.post('/albums', data)
  return res.data
}

// 更新一个已存在的专辑
export async function updateAlbum(id, data) {
  const res = await api.put(`/albums/${id}`, data)
  return res.data
}

// 删除一个专辑
export async function deleteAlbum(id) {
  const res = await api.delete(`/albums/${id}`)
  return res.data
}
