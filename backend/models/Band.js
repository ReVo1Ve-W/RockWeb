// Mongoose 的 Schema（模式）：定义"一个乐队"在数据库里长什么样
// 可以把它类比成 Excel 表格的表头 —— 规定每一行（每个乐队）要填哪些列，以及每列是什么类型
const mongoose = require('mongoose')

const bandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 必填字段，不填存不进数据库
    },
    nameEn: {
      type: String, // 英文名，方便以后搜索/排序
    },
    avatar: {
      type: String, // 乐队头像/logo 图片链接
    },
    coverImage: {
      type: String, // 首页轮播图用的大图
    },
    genre: {
      type: [String], // [String] 表示"字符串数组"，一个乐队可以有多个风格标签
      default: [],
    },
    country: {
      type: String,
    },
    formedYear: {
      type: Number, // 成立年份
    },
    bio: {
      type: String, // 乐队简介，长文本
    },
    members: [
      {
        name: String,
        role: String, // 例如：主唱、吉他手、鼓手
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false, // 是否在首页轮播图里展示
    },
  },
  {
    // timestamps 会自动给每条记录加上 createdAt / updatedAt 字段，记录创建和修改时间
    timestamps: true,
  }
)

// mongoose.model(名字, schema) 把上面的"表头"注册成一个可以在代码里用的模型
// 'Band' 会自动对应 MongoDB 里的 'bands' 集合（collection，相当于表）
module.exports = mongoose.model('Band', bandSchema)
