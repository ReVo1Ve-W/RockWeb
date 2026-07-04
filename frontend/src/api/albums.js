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
