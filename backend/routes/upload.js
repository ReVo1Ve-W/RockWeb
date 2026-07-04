// routes/upload.js：文件上传接口
// 前端选好文件后，把文件发到这里，这里再转发给 Cloudinary，
// 最后把 Cloudinary 返回的永久访问链接传回给前端，前端把这个链接填进表单对应字段
const express = require('express')
const router = express.Router()
const cloudinary = require('../config/cloudinary')
const { requireAuth } = require('../middleware/auth')
const { imageUpload, audioUpload } = require('../middleware/upload')

// 把 multer 存在内存里的文件（Buffer）上传到 Cloudinary。
// Cloudinary 官方 SDK 是基于"流"设计的，这里用 upload_stream 配合一个小转换，
// 让内存里的 Buffer 能够"喂"给它
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    stream.end(buffer)
  })
}

// POST /api/upload/image —— 上传图片（乐队头像/封面图、专辑封面图等）
// requireAuth 保护：只有登录的管理员能上传，避免被任何人拿来当免费图床用
// imageUpload.single('file') 表示：这个接口预期收到一个字段名叫 "file" 的单个文件
router.post('/image', requireAuth, imageUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有收到文件' })
  }
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'rockweb/images', // Cloudinary 里的目录，方便区分是哪类素材
      resource_type: 'image',
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ message: '图片上传失败', error: err.message })
  }
})

// POST /api/upload/audio —— 上传音频（仅限用户确认拥有权利的音频片段）
router.post('/audio', requireAuth, audioUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有收到文件' })
  }
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'rockweb/audio',
      resource_type: 'video', // Cloudinary 把音频归类在 "video" 资源类型下处理
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ message: '音频上传失败', error: err.message })
  }
})

module.exports = router
