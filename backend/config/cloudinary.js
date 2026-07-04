// config/cloudinary.js：配置 Cloudinary 云存储服务的连接
// Cloudinary 是一个专门存图片/音视频文件的云服务：我们的后端不用自己管理磁盘存储
// （尤其是 Render 这类免费平台，服务器上的文件在每次重新部署后会被清空，
// 不适合存长期需要保留的用户上传内容），上传的文件交给 Cloudinary 保管，
// 它返回一个永久可访问的网址，我们把这个网址存进数据库就行
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = cloudinary
