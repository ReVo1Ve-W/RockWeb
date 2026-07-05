// scripts/setPlayerHeight.js：把数据库里所有网易云音乐 embedUrl 的 height 参数
// 统一设置成目标值。用法：node scripts/setPlayerHeight.js 86
//
// height 参数控制网易云外链播放器显示哪种界面：
//   height=66  → 迷你播放器，只有封面+播放按钮，没有音量/进度条
//   height=86  → 完整控制栏，含音量滑条和进度条（用户可以自己拖动音量条来调节）
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
