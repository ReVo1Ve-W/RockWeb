// middleware/auth.js：保护"新增/修改/删除"这类写操作的接口
// 把它像一道门卫一样"插"在路由处理函数前面：请求先经过这里检查，
// 检查通过（有合法的登录凭证）才会继续往后走，否则直接拒绝
const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  // 前端登录后，会在每次请求的 HTTP 头里带上：
  // Authorization: Bearer <一长串token>
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，请先登录后台管理' })
  }

  // 把 "Bearer " 这个前缀去掉，剩下的才是真正的 token
  const token = authHeader.slice('Bearer '.length)

  try {
    // jwt.verify 会检查这个 token 是不是用同一个 JWT_SECRET 签发的、有没有过期，
    // 篡改过的 token 或者过期的 token 都会在这里被识别出来并抛出异常
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = payload // 后续路由里如果需要，可以从 req.admin 拿到登录者信息
    next() // 检查通过，放行，继续执行原本的路由逻辑
  } catch (err) {
    return res.status(401).json({ message: '登录已失效，请重新登录' })
  }
}

module.exports = { requireAuth }
