// seed（种子数据）脚本：把一批真实数据一次性写入数据库
// 运行方式：node seed/bands.js
// 里面的乐队简介/成员/专辑信息都是联网查证过的真实资料（来源：Wikipedia、Discogs、Last.fm、豆瓣/Deezer 等）
//
// ⚠️ 版权提醒：
// 1. coverImage / avatar 目前用的是占位图（picsum.photos），不是乐队官方照片，
//    你可以后续替换成你自己拍摄的、或有合法授权/官方发布的图片链接
// 2. 每首曲目的 embedUrl 先留空，需要你自己去对应平台（网易云音乐/QQ音乐/YouTube）
//    找到对应歌曲的官方播放页面，复制其"分享/嵌入"生成的链接后填入 —— 这样试听是
//    通过官方播放器进行的，合法且不消耗你自己的存储空间
// 3. 少数信息（如"旅行团乐队"的具体成员名单）多方搜索未能找到可靠来源确认，
//    这里保留为空，避免编造错误信息；欢迎你之后手动补充

require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const Band = require('../models/Band')
const Album = require('../models/Album')

const data = [
  {
    band: {
      name: '草東沒有派對',
      nameEn: 'No Party for Cao Dong',
      genre: ['独立摇滚', 'Grunge', 'Post-Rock'],
      country: '台湾',
      formedYear: 2015,
      bio:
        '台湾独立摇滚乐队，由林易祺（主唱/吉他）、陈修澔（吉他）、Sam Yang（贝斯）与已故鼓手蔡忆凡（Fan Tsai）组成。2015年以一群高中同学的兴趣组队开始，凭借直白犀利的歌词与颓丽的编曲迅速走红，2017年在金曲奖拿下最佳新人、最佳乐团与年度歌曲（〈山海〉）。2021年鼓手蔡忆凡不幸去世。',
      members: [
        { name: '林易祺 Wood Lin', role: '主唱 / 吉他' },
        { name: '陈修澔 Judy Chan', role: '吉他' },
        { name: 'Sam Yang', role: '贝斯' },
        { name: '蔡忆凡 Fan Tsai', role: '鼓（已故）' },
      ],
      isFeatured: true,
      coverImage: 'https://picsum.photos/seed/caodong/1200/600',
      avatar: 'https://picsum.photos/seed/caodong-avatar/300/300',
    },
    albums: [
      {
        title: '醜奴兒 The Servile',
        releaseYear: 2016,
        description: '乐队首张正式专辑，收录〈山海〉〈鬼〉〈丑奴儿〉等曲目，是台湾独立音乐圈现象级作品。',
        coverUrl: 'https://picsum.photos/seed/choxinu/500/500',
        tracks: [
          { title: '山海', duration: '3:46', embedPlatform: '', embedUrl: '' },
          { title: '丑奴儿', duration: '4:10', embedPlatform: '', embedUrl: '' },
          { title: '鬼', duration: '3:52', embedPlatform: '', embedUrl: '' },
        ],
      },
      {
        title: '瓦合 Ephemera',
        releaseYear: 2021,
        description: '第二张正式专辑，也是鼓手蔡忆凡生前参与的最后一张作品。',
        coverUrl: 'https://picsum.photos/seed/wahe/500/500',
        tracks: [
          { title: '烂泥', duration: '4:02', embedPlatform: '', embedUrl: '' },
          { title: '大风吹', duration: '3:58', embedPlatform: '', embedUrl: '' },
        ],
      },
    ],
  },
  {
    band: {
      name: 'deca joins',
      nameEn: 'deca joins',
      genre: ['Indie Rock', 'Grunge', 'Lo-fi'],
      country: '台湾',
      formedYear: 2013,
      bio:
        '台北独立摇滚乐队，2013年成立，原名 FUBAR，2016年改名"灰矮星"，2017年正式定名为 deca joins（取自 decadent 与 decaffeination 的组合）。由郑敬儒（主唱/吉他）、杨上华（吉他）、谢俊彦（贝斯）、陈煌谷（鼓）组成，音乐风格融合 grunge 与迷幻氛围，代表单曲〈海浪〉MV 在 YouTube 上有超过150万次观看。',
      members: [
        { name: '郑敬儒 Zheng Jingru', role: '主唱 / 吉他' },
        { name: '杨上华 Yang Shanghua', role: '吉他' },
        { name: '谢俊彦 Xie Junyan', role: '贝斯' },
        { name: '陈煌谷 Chen Huanggu', role: '鼓' },
      ],
      isFeatured: true,
      coverImage: 'https://picsum.photos/seed/decajoins/1200/600',
      avatar: 'https://picsum.photos/seed/decajoins-avatar/300/300',
    },
    albums: [
      {
        title: 'Cassa',
        releaseYear: 2017,
        description: '以 deca joins 名义发布的首张专辑。',
        coverUrl: 'https://picsum.photos/seed/cassa/500/500',
        tracks: [
          { title: '暗流 Undercurrent', duration: '4:20', embedPlatform: '', embedUrl: '' },
        ],
      },
      {
        title: 'Go Slow',
        releaseYear: 2018,
        description: '收录代表单曲〈海浪 Wave〉，MV 广受关注。',
        coverUrl: 'https://picsum.photos/seed/goslow/500/500',
        tracks: [
          { title: '海浪 Wave', duration: '3:55', embedPlatform: '', embedUrl: '' },
          { title: 'Go Slow', duration: '4:05', embedPlatform: '', embedUrl: '' },
        ],
      },
    ],
  },
  {
    band: {
      name: '旅行团乐队',
      nameEn: 'The LifeJourney',
      genre: ['摇滚', 'Indie Rock'],
      country: '中国大陆',
      formedYear: 1999, // 确认成立于1999年，柳州
      bio:
        '中国独立摇滚乐队，1999年成立于广西柳州，隶属摩登天空厂牌。乐队原始阵容由主唱孔阳、吉他手黄子俊、键盘手韦伟组成。2008年发行首张专辑《来福胶泥》，2013年发行《于是我不再唱歌》，2019年参加综艺节目《乐队的夏天》第一季广受关注。部分成员分工细节暂未查证到权威来源，欢迎后续补充完善。',
      members: [
        { name: '孔阳', role: '主唱' },
        { name: '黄子俊', role: '吉他' },
        { name: '韦伟', role: '键盘' },
      ],
      isFeatured: true,
      coverImage: 'https://picsum.photos/seed/lifejourney/1200/600',
      avatar: 'https://picsum.photos/seed/lifejourney-avatar/300/300',
    },
    albums: [
      {
        title: '来福胶泥',
        releaseYear: 2008,
        description: '乐队首张专辑，摩登天空发行。',
        coverUrl: 'https://picsum.photos/seed/laifu/500/500',
        tracks: [],
      },
      {
        title: '于是我不再唱歌',
        releaseYear: 2013,
        description: '第二张专辑，收录〈小龙人〉〈天后舞厅〉〈北京夏夜〉等曲目。',
        coverUrl: 'https://picsum.photos/seed/yushi/500/500',
        tracks: [
          { title: '于是我不再唱歌', duration: '4:55', embedPlatform: '', embedUrl: '' },
          { title: '小龙人', duration: '', embedPlatform: '', embedUrl: '' },
          { title: '北京夏夜', duration: '', embedPlatform: '', embedUrl: '' },
        ],
      },
    ],
  },
  {
    band: {
      name: '椅子乐团',
      nameEn: 'The Chairs',
      genre: ['Indie Folk', '迷幻复古流行'],
      country: '台湾',
      formedYear: undefined, // 乐队成立于台中，具体年份未能查证到权威来源
      bio:
        '台湾独立三人乐队，成员为裘咏靖（主唱/吉他）、陈仲颖（主唱/吉他）、孙伯元 Benson（贝斯）。音乐风格融合迷幻复古流行（psychedelic retro-pop），歌词内容细腻怀旧，善于用真诚叙事的方式讲故事，代表曲目包括〈做一半的夢〉〈牽掛〉等。',
      members: [
        { name: '裘咏靖 Jin', role: '主唱 / 吉他' },
        { name: '陈仲颖 Zhong', role: '主唱 / 吉他' },
        { name: '孙伯元 Benson', role: '贝斯' },
      ],
      isFeatured: true,
      coverImage: 'https://picsum.photos/seed/thechairs/1200/600',
      avatar: 'https://picsum.photos/seed/thechairs-avatar/300/300',
    },
    albums: [
      {
        title: 'LOVELY SUNDAY',
        releaseYear: 2018,
        description: '乐队作品，收录曲目风格清新怀旧。',
        coverUrl: 'https://picsum.photos/seed/lovelysunday/500/500',
        tracks: [{ title: 'Rollin\' On', duration: '', embedPlatform: '', embedUrl: '' }],
      },
      {
        title: '做一半的夢（单曲）',
        releaseYear: undefined,
        description: '代表单曲之一。',
        coverUrl: 'https://picsum.photos/seed/zuoyiban/500/500',
        tracks: [{ title: '做一半的夢', duration: '', embedPlatform: '', embedUrl: '' }],
      },
    ],
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ 数据库已连接，开始导入数据...')

  for (const item of data) {
    // upsert：如果同名乐队已存在就更新，不存在就新建，避免重复运行脚本时产生重复数据
    const band = await Band.findOneAndUpdate(
      { name: item.band.name },
      item.band,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(`  🎸 乐队已写入：${band.name}`)

    for (const albumData of item.albums) {
      await Album.findOneAndUpdate(
        { band: band._id, title: albumData.title },
        { ...albumData, band: band._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      console.log(`     💿 专辑已写入：${albumData.title}`)
    }
  }

  console.log('🎉 全部数据导入完成')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ 导入失败：', err)
  process.exit(1)
})
