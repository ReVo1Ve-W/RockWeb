// scripts/updateEmbedLinks.js：一次性脚本，把已确认的网易云音乐嵌入链接填进对应曲目
// 运行方式：node scripts/updateEmbedLinks.js
// 这不是常规业务代码，是一次性维护脚本，跑完之后可以留着，以后要批量改数据时还能再用
require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const Album = require('../models/Album')

// 网易云音乐的外链播放器地址格式是固定的：
// https://music.163.com/outchain/player?type=2&id=歌曲ID&auto=0&height=66
// 这是网易云官方提供的"分享-生成外链播放器"功能生成的标准格式，属于官方支持的合法嵌入方式
function buildNeteaseEmbedUrl(songId) {
  return `https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=66`
}

// 曲目名 -> 网易云歌曲ID 的对照表（用户手动在网易云音乐网页上查证确认的真实ID）
const trackIdMap = {
  山海: '411314659',
  鬼: '411315635',
  大风吹: '411314657',
  烂泥: '411314656',
  '暗流 Undercurrent': '2097764786',
  '海浪 Wave': '1320101152',
  于是我不再唱歌: '28168577',
  "Rollin' On": '574925512',
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ 数据库已连接')

  const albums = await Album.find({})
  let updatedCount = 0

  for (const album of albums) {
    let albumChanged = false
    for (const track of album.tracks) {
      const songId = trackIdMap[track.title]
      if (songId) {
        track.embedPlatform = '网易云音乐'
        track.embedUrl = buildNeteaseEmbedUrl(songId)
        albumChanged = true
        updatedCount++
        console.log(`  🎵 ${album.title} - ${track.title} → 已配置嵌入链接`)
      }
    }
    if (albumChanged) {
      await album.save()
    }
  }

  console.log(`🎉 共更新 ${updatedCount} 首曲目`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('❌ 更新失败：', err)
  process.exit(1)
})
