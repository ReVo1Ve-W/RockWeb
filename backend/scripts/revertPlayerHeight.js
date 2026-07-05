// scripts/revertPlayerHeight.js：一次性脚本，把数据库里所有网易云音乐 embedUrl
// 从 height=86（完整控制栏）改回 height=66（迷你播放器，之前的样子）
require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const Album = require('../models/Album')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ 数据库已连接')

  const albums = await Album.find({})
  let updated = 0

  for (const album of albums) {
    let changed = false
    for (const track of album.tracks) {
      if (track.embedUrl && track.embedUrl.includes('music.163.com/outchain/player')) {
        track.embedUrl = track.embedUrl.replace(/height=86/, 'height=66')
        changed = true
        updated++
        console.log(`  🎵 ${track.title} → height=66`)
      }
    }
    if (changed) await album.save()
  }

  console.log(`🎉 共还原 ${updated} 首曲目的播放器高度参数`)
  await mongoose.disconnect()
}

run().catch(err => { console.error('❌ 失败：', err); process.exit(1) })
