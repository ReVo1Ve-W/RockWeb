// "专辑"的数据模型
const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema(
  {
    // 关联到 Band 模型：这里存的是某个乐队文档的 _id，
    // 相当于 SQL 里的"外键"，表示"这张专辑属于哪个乐队"
    band: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Band',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    coverUrl: {
      type: String, // 专辑封面图
    },
    releaseYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    tracks: [
      {
        title: String, // 曲目名
        duration: String, // 时长，例如 "4:32"
        // embedPlatform / embedUrl：合法试听方案 —— 存第三方平台（网易云/QQ音乐/YouTube等）
        // 官方播放器的嵌入链接，前端直接用 iframe 渲染，不涉及版权风险
        embedPlatform: String,
        embedUrl: String,
        // audioUrl：自行上传的音频文件链接（存在 Cloudinary），
        // ⚠️ 仅限用户确认自己拥有权利的音频内容，跟上面的官方嵌入方案是两条独立路径，
        // 前端会同时展示这两种试听方式（如果都填了）
        audioUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Album', albumSchema)
