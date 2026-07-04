// middleware/upload.js：用 multer 处理"前端上传文件"这件事
// multer 的作用：浏览器上传文件时，HTTP 请求体的格式是 multipart/form-data，
// 跟我们之前一直用的 JSON 格式不一样，express.json() 处理不了这种格式，
// 需要专门的中间件（multer）来解析出文件内容
const multer = require('multer')

// storage: 'memory' 表示上传的文件先临时放在服务器内存里（不写入磁盘），
// 我们马上就会把它转发给 Cloudinary，用不着真的落地成本地文件，
// 这样也避免了 Render 免费套餐"重启后文件会丢失"的问题——因为压根不落盘
const storage = multer.memoryStorage()

// 图片：限制 5MB，且必须是常见图片格式，防止有人上传超大文件或恶意文件占用资源
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只能上传图片文件'))
    }
  },
})

// 音频：限制 20MB（一首完整歌曲的常见大小），必须是音频格式
const audioUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('只能上传音频文件'))
    }
  },
})

module.exports = { imageUpload, audioUpload }
