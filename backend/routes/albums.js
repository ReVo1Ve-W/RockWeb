// 跟"专辑"相关的路由
const express = require('express')
const router = express.Router()
const Album = require('../models/Album')
const { requireAuth } = require('../middleware/auth')

// GET /api/albums?band=xxxx
// 获取专辑列表，可以用 ?band=乐队id 筛选出"某个乐队的所有专辑"
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.band) {
      filter.band = req.query.band
    }
    // .populate('band', 'name') 会把 band 字段从"一个 id 字符串"自动换成
    // 对应乐队文档里的 { _id, name } —— 这样前端展示专辑列表时能直接显示"属于哪个乐队"，
    // 不用额外再发一次请求去查乐队名字
    const albums = await Album.find(filter)
      .sort({ releaseYear: 1 })
      .populate('band', 'name')
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: '获取专辑列表失败', error: err.message })
  }
})

// GET /api/albums/:id
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({ message: '未找到该专辑' })
    }
    res.json(album)
  } catch (err) {
    res.status(500).json({ message: '获取专辑详情失败', error: err.message })
  }
})

// POST /api/albums
router.post('/', requireAuth, async (req, res) => {
  try {
    const album = await Album.create(req.body)
    res.status(201).json(album)
  } catch (err) {
    res.status(400).json({ message: '创建专辑失败', error: err.message })
  }
})

// PUT /api/albums/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!album) {
      return res.status(404).json({ message: '未找到该专辑' })
    }
    res.json(album)
  } catch (err) {
    res.status(400).json({ message: '更新专辑失败', error: err.message })
  }
})

// DELETE /api/albums/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id)
    if (!album) {
      return res.status(404).json({ message: '未找到该专辑' })
    }
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ message: '删除专辑失败', error: err.message })
  }
})

module.exports = router
