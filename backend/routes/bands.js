// 路由（routes）：定义"当有人访问某个网址时，后端该怎么响应"
// 这个文件专门处理所有跟"乐队"相关的请求，路径都以 /api/bands 开头（在 server.js 里挂载）
const express = require('express')
const router = express.Router()
const Band = require('../models/Band')
const { requireAuth } = require('../middleware/auth')

// GET /api/bands
// 获取乐队列表。支持 ?featured=true 只查"首页轮播要展示的乐队"
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.featured === 'true') {
      filter.isFeatured = true
    }
    const bands = await Band.find(filter).sort({ createdAt: -1 })
    res.json(bands)
  } catch (err) {
    res.status(500).json({ message: '获取乐队列表失败', error: err.message })
  }
})

// GET /api/bands/:id
// 获取单个乐队详情，:id 是"路径参数"，比如访问 /api/bands/64f... 时 req.params.id 就是那个 id
router.get('/:id', async (req, res) => {
  try {
    const band = await Band.findById(req.params.id)
    if (!band) {
      return res.status(404).json({ message: '未找到该乐队' })
    }
    res.json(band)
  } catch (err) {
    res.status(500).json({ message: '获取乐队详情失败', error: err.message })
  }
})

// POST /api/bands
// 新增一个乐队。req.body 是前端发过来的 JSON 数据
// requireAuth 作为第二个参数插在路径和处理函数之间：这类"写"操作必须先登录才能调用
router.post('/', requireAuth, async (req, res) => {
  try {
    const band = await Band.create(req.body)
    res.status(201).json(band)
  } catch (err) {
    res.status(400).json({ message: '创建乐队失败', error: err.message })
  }
})

// PUT /api/bands/:id
// 更新一个已存在的乐队信息
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const band = await Band.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // 返回更新后的数据，而不是更新前的
      runValidators: true, // 更新时也按 Schema 校验一遍
    })
    if (!band) {
      return res.status(404).json({ message: '未找到该乐队' })
    }
    res.json(band)
  } catch (err) {
    res.status(400).json({ message: '更新乐队失败', error: err.message })
  }
})

// DELETE /api/bands/:id
// 删除一个乐队
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const band = await Band.findByIdAndDelete(req.params.id)
    if (!band) {
      return res.status(404).json({ message: '未找到该乐队' })
    }
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ message: '删除乐队失败', error: err.message })
  }
})

module.exports = router
