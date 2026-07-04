// routes/auth.js：登录接口
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: '请输入账号和密码' })
  }

  // 因为整个网站只有"你"一个管理员，账号密码存在环境变量里，
  // 不需要为此专门建一张数据库表——这是"单管理员"场景下更简单的做法
  const validUsername = username === process.env.ADMIN_USERNAME

  // bcrypt.compare 会把你输入的密码用同样的算法加密一遍，
  // 跟 .env 里存的加密结果比较是否一致，整个过程不会还原出原始密码
  const validPassword = validUsername
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : false

  if (!validUsername || !validPassword) {
    // 账号错和密码错都返回同一句提示，不明确指出是哪一项错了，
    // 避免被用来"试探"出正确的账号名（一个基本的安全习惯）
    return res.status(401).json({ message: '账号或密码错误' })
  }

  // 签发一个 token，7 天后自动过期，过期后需要重新登录
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  res.json({ token })
})

module.exports = router
