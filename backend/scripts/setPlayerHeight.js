// scripts/setPlayerHeight.js：把数据库里所有网易云音乐 embedUrl 的 height 参数
// 统一设置成目标值。用法：node scripts/setPlayerHeight.js 66
//
// 实测网易云外链播放器本身不提供音量滑条这个控件（无论 height 调多大都不会凭空出现），
// 调大只会让容器需要更高才能完整展示内容，容器不够高会把内容硬生生裁掉。
// 目前项目统一固定使用官方默认值 height=66（迷你播放器：封面+进度条+播放控制）。
require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const Album = require('../models/Album')

const targetHeight = process.argv[2]
if (!targetHeight || !/^\d+$/.test(targetHeight)) {
  console.error('用法：node scripts/setPlayerHeight.js 目标高度数字，例如 86')
  process.exit(1)
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ 数据库已连接')

  const albums = await Album.find({})
  let updated = 0

  for (const album of albums) {
    let changed = false
    for (const track of album.tracks) {
      if (track.embedUrl && track.embedUrl.includes('music.163.com/outchain/player')) {
        const newUrl = track.embedUrl.replace(/height=\d+/, `height=${targetHeight}`)
        if (newUrl !== track.embedUrl) {
          track.embedUrl = newUrl
          changed = true
          updated++
          console.log(`  🎵 ${track.title} → height=${targetHeight}`)
        }
      }
    }
    if (changed) await album.save()
  }

  console.log(`🎉 共更新 ${updated} 首曲目的播放器高度参数为 height=${targetHeight}`)
  await mongoose.disconnect()
}

run().catch(err => { console.error('❌ 失败：', err); process.exit(1) })
