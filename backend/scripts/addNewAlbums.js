// scripts/addNewAlbums.js：一次性脚本，新建几张此前数据库里没有收录的专辑，
// 并直接配好网易云音乐的官方嵌入链接
require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const Band = require('../models/Band')
const Album = require('../models/Album')

function buildNeteaseEmbedUrl(songId) {
  return `https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=86`
}

const newAlbums = [
  {
    bandName: 'deca joins',
    title: '浴室',
    releaseYear: 2017,
    description: '2017年发行的专辑，在台湾及国际乐迷中广受好评，同名主打曲《浴室》是代表作之一。',
    coverUrl: 'https://picsum.photos/seed/yushi-decajoins/500/500',
    tracks: [
      { title: '浴室', duration: '', embedPlatform: '网易云音乐', embedUrl: buildNeteaseEmbedUrl('483378334') },
    ],
  },
  {
    bandName: '椅子乐团',
    title: 'Real Love Is...',
    releaseYear: 2020,
    description: '椅子乐团2020年发行的专辑，收录《你知道天空有多蓝》《树屋》等曲目。',
    coverUrl: 'https://picsum.photos/seed/reallove-chairs/500/500',
    tracks: [
      { title: '你知道天空有多蓝', duration: '', embedPlatform: '网易云音乐', embedUrl: buildNeteaseEmbedUrl('2717465891') },
      { title: '树屋', duration: '', embedPlatform: '网易云音乐', embedUrl: buildNeteaseEmbedUrl('1487202784') },
    ],
  },
  {
    bandName: '旅行团乐队',
    title: '永远都会在',
    releaseYear: undefined,
    description: '旅行团乐队发行的单曲。',
    coverUrl: 'https://picsum.photos/seed/yongyuan-lifejourney/500/500',
    tracks: [
      { title: '永远都会在', duration: '', embedPlatform: '网易云音乐', embedUrl: buildNeteaseEmbedUrl('486999662') },
    ],
  },
  {
    bandName: '旅行团乐队',
    title: "我要走啦(I'm Leaving)",
    releaseYear: undefined,
    description: '旅行团乐队发行的单曲。',
    coverUrl: 'https://picsum.photos/seed/wozouyla-lifejourney/500/500',
    tracks: [
      { title: '我要走啦', duration: '', embedPlatform: '网易云音乐', embedUrl: buildNeteaseEmbedUrl('2715085879') },
    ],
  },
]

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ 数据库已连接')

  for (const item of newAlbums) {
    const band = await Band.findOne({ name: item.bandName })
    if (!band) {
      console.log(`  ⚠️ 未找到乐队"${item.bandName}"，跳过《${item.title}》`)
      continue
    }
    // upsert：如果同名专辑已存在就更新，避免重复运行脚本时产生重复数据
    const album = await Album.findOneAndUpdate(
      { band: band._id, title: item.title },
      {
        band: band._id,
        title: item.title,
        releaseYear: item.releaseYear,
        description: item.description,
        coverUrl: item.coverUrl,
        tracks: item.tracks,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(`  💿 已写入《${album.title}》→ ${item.bandName}`)
  }

  console.log('🎉 全部新专辑处理完成')
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('❌ 处理失败：', err)
  process.exit(1)
})
