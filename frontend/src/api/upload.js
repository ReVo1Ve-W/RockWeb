// api/upload.js：封装文件上传请求
// 跟其他 API 函数不一样的地方：这里发的不是 JSON，而是 FormData
// （浏览器专门用来装文件的一种数据格式，能把文件的二进制内容打包进请求里）
import { api } from './client.js'

export async function uploadImage(file) {
  const formData = new FormData()
  // 'file' 这个字段名要跟后端 multer 配置的 .single('file') 对应上
  formData.append('file', file)
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data // { url: '...' }
}

export async function uploadAudio(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/upload/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
