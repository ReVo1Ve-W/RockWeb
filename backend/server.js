// server.js：整个后端服务的入口文件，运行 `node server.js` 就是从这里开始执行
require('dotenv').config() // 读取 .env 文件里的变量，塞进 process.env

// MongoDB Atlas 的连接地址需要查询一种叫 SRV 的特殊 DNS 记录。
// 有些电脑/路由器自带的 DNS 服务器不支持解析这种记录，会导致连接失败
// （报错关键词：querySrv ECONNREFUSED）。这里强制改用 Google 的公共 DNS 服务器，
// 绕开系统默认 DNS 的问题，只影响这个 Node 进程，不会更改你电脑的系统网络设置。
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const bandsRouter = require('./routes/bands')
const albumsRouter = require('./routes/albums')

const app = express()

// --- 中间件（middleware）：每个请求进来之前都会先经过这些处理 ---
// CORS_ORIGIN 从环境变量读取"允许访问的前端域名"，用逗号分隔可以配置多个
// （比如同时允许 Vercel 正式域名和本地开发地址）。
// 本地没配置这个变量时，回退到允许所有来源，保留本地开发的便利性；
// 部署到线上后，Render 环境变量里应该设置成 Vercel 分配的真实域名，
// 避免任何网站都能随意调用咱们的后端接口
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : true // true 表示不限制来源

app.use(cors({ origin: allowedOrigins }))
app.use(express.json()) // 让 Express 能自动解析前端发过来的 JSON 格式请求体

// --- 挂载路由：把 bands.js / albums.js 里定义的规则接入到对应的网址前缀下 ---
// 之后访问 /api/bands/xxx 就会走 routes/bands.js 里对应的逻辑
app.use('/api/bands', bandsRouter)
app.use('/api/albums', albumsRouter)

// 一个最简单的"健康检查"接口，用来确认服务是否正常运行
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rock Web 后端运行正常 🤘' })
})

const PORT = process.env.PORT || 4000

// 先连接数据库，连接成功后才启动服务器监听端口
// 这样可以保证：服务器一旦"能接收请求"，数据库必然已经连上了
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 连接成功')
    app.listen(PORT, () => {
      console.log(`🚀 后端服务已启动：http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB 连接失败：', err.message)
    process.exit(1) // 数据库连不上，服务没有意义，直接退出进程
  })
