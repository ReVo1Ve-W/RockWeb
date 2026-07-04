// scripts/hashPassword.js：一个小工具脚本，帮你把"想要的密码"转换成加密后的字符串
// 用法：node scripts/hashPassword.js 你的密码
// 输出的那一长串字符，复制到 .env 的 ADMIN_PASSWORD_HASH 里
//
// 为什么要加密存储：如果直接把密码原文写进 .env，一旦这个文件不小心泄露
// （比如误传到公共仓库），密码就直接暴露了。bcrypt 是一种"只能加密、
// 几乎不能反向破解"的算法，服务器只保存加密后的结果，登录时用同样的算法
// 把你输入的密码加密一遍，比较两个加密结果是否一致，而不是直接比较原文密码
const bcrypt = require('bcryptjs')

const plainPassword = process.argv[2]

if (!plainPassword) {
  console.error('用法：node scripts/hashPassword.js 你想要的密码')
  process.exit(1)
}

// 10 是"加盐轮数"，数字越大越安全但计算越慢，10 是业界常用的平衡值
const hash = bcrypt.hashSync(plainPassword, 10)
console.log('加密后的密码（复制这一串到 .env 的 ADMIN_PASSWORD_HASH）：')
console.log(hash)
