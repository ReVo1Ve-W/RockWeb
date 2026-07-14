<script setup>
// <script setup> 是"逻辑区"：写数据和交互逻辑
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBandById } from '../api/bands.js'
import { getAlbumsByBand } from '../api/albums.js'
import AlbumCard from '../components/AlbumCard.vue'
import fallbackImage from '../assets/generated/rockweb-archive-portrait.png'

// useRoute() 让组件能读取"当前网址"的信息，比如 /bands/64f1a2b3 里的 64f1a2b3
// useRouter() 用来主动触发跳转（比如点"返回首页"按钮）
const route = useRoute()
const router = useRouter()

const band = ref(null)
const albums = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    // route.params.id 就是路由配置里 /bands/:id 这个 :id 对应的实际值
    const bandId = route.params.id
    // Promise.all 同时发出两个请求（查乐队详情 + 查这个乐队的专辑），
    // 不用一个等完了再等下一个，两个请求并行进行，页面能更快加载完
    const [bandData, albumsData] = await Promise.all([
      getBandById(bandId),
      getAlbumsByBand(bandId),
    ])
    band.value = bandData
    albums.value = albumsData
  } catch (err) {
    console.error('获取乐队详情失败：', err)
    errorMessage.value = '暂时无法加载乐队详情，请确认后端服务是否正常'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="detail-page">
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>

    <template v-else-if="band">
      <!-- 顶部大图 + 乐队名，跟首页轮播图风格保持一致 -->
      <div class="hero" :style="{ backgroundImage: `url(${band.coverImage || fallbackImage})` }">
        <div class="hero-scrim"></div>
        <button class="back-btn" @click="router.push({ name: 'home' })">← 返回首页</button>
        <div class="hero-content">
          <h1>{{ band.name }}</h1>
          <div class="meta">
            <span class="chip" v-for="g in band.genre" :key="g">{{ g }}</span>
            <span class="country">{{ band.country }}</span>
            <span v-if="band.formedYear" class="country">· {{ band.formedYear }} 年成立</span>
          </div>
        </div>
      </div>

      <div class="body">
        <section class="bio-section">
          <h3>乐队简介</h3>
          <p>{{ band.bio }}</p>

          <!-- v-if="band.members.length" 只有真的有成员数据时才显示这个区块，
               避免出现一个空的"乐队成员"标题却啥都没有 -->
          <div v-if="band.members && band.members.length" class="members">
            <h4>乐队成员</h4>
            <ul>
              <li v-for="m in band.members" :key="m.name">
                <strong>{{ m.name }}</strong> · {{ m.role }}
              </li>
            </ul>
          </div>
        </section>

        <section class="albums-section">
          <h3>代表专辑</h3>
          <div v-if="albums.length === 0" class="empty">暂无收录的专辑信息</div>
          <!-- AlbumCard 是我们接下来要写的子组件，专门负责展示"一张专辑 + 可展开的曲目列表" -->
          <AlbumCard v-for="album in albums" :key="album._id" :album="album" :band="band" />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
}

.status {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.status.error {
  color: var(--coral-text);
}

.hero {
  position: relative;
  height: min(590px, 64vh);
  border-bottom: 1px solid var(--ink);
  background-size: cover;
  background-position: center;
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(29, 27, 26, 0.88) 0%, rgba(29, 27, 26, 0.22) 60%, rgba(29, 27, 26, 0.36) 100%),
    linear-gradient(90deg, rgba(29, 27, 26, 0.52), transparent 70%);
}

.back-btn {
  position: absolute;
  top: 24px;
  left: 32px;
  z-index: 2;
  background: rgba(243, 238, 229, 0.16);
  border: 1px solid var(--paper);
  backdrop-filter: blur(6px);
  color: #fff;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
}

.back-btn:hover {
  background: var(--coral);
  color: var(--ink);
}

.hero-content {
  position: absolute;
  left: 56px;
  bottom: 40px;
  z-index: 1;
  color: var(--paper);
}

.hero-content h1 {
  margin: 0 0 16px;
  font-family: var(--sans);
  font-size: clamp(46px, 7vw, 96px);
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(29, 27, 26, 0.2);
  border: 1px solid rgba(243, 238, 229, 0.6);
  font-size: 13px;
  font-weight: 600;
}

.country {
  font-size: 14px;
  color: rgba(243, 238, 229, 0.78);
}

.body {
  max-width: var(--max);
  margin: 0 auto;
  padding: 84px var(--pad) 110px;
}

.bio-section h3,
.albums-section h3 {
  margin: 0 0 16px;
  font-family: var(--sans);
  font-size: clamp(38px, 5vw, 62px);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.bio-section p {
  max-width: 760px;
  color: var(--muted);
  line-height: 1.8;
  font-size: 16px;
}

.members {
  margin-top: 32px;
}

.members h4 {
  font-size: 15px;
  color: var(--coral-text);
  letter-spacing: 1px;
  margin: 0 0 12px;
}

.members ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.members li {
  background: var(--paper-2);
  border: 1px solid var(--line);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--ink);
}

.albums-section {
  margin-top: 96px;
}

.empty {
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 720px) {
  .hero {
    height: 320px;
  }
  .hero-content {
    left: 24px;
    bottom: 24px;
    right: 24px;
  }
  .hero-content h1 {
    font-size: 36px;
  }
  .body {
    padding: 40px 20px 64px;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 280px;
  }
  .hero-content h1 {
    font-size: 28px;
  }
  .back-btn {
    top: 16px;
    left: 16px;
    padding: 6px 14px;
    font-size: 13px;
  }
  .chip,
  .country {
    font-size: 12px;
  }
  .body {
    padding: 32px 16px 48px;
  }
  .bio-section h3,
  .albums-section h3 {
    font-size: 20px;
  }
  .bio-section p {
    font-size: 15px;
  }
  .members ul {
    gap: 8px;
  }
  .members li {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
