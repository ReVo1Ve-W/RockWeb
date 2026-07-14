<script setup>
// BandList.vue：展示全部乐队的卡片网格
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllBands } from '../api/bands.js'
import fallbackImage from '../assets/generated/rockweb-archive-portrait.png'

const router = useRouter()
const bands = ref([])
const loading = ref(true)
const errorMessage = ref('')
const brokenImages = ref(new Set())

onMounted(async () => {
  try {
    bands.value = await getAllBands()
  } catch (err) {
    console.error('获取乐队列表失败：', err)
    errorMessage.value = '暂时无法加载乐队列表，请确认后端服务是否正常'
  } finally {
    loading.value = false
  }
})

function goToBand(band) {
  router.push({ name: 'band-detail', params: { id: band._id } })
}

function markImageBroken(id) {
  brokenImages.value = new Set([...brokenImages.value, id])
}
</script>

<template>
  <div class="list-page">
    <h1>全部乐队</h1>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="bands.length === 0" class="status">暂无乐队数据</div>

    <div v-else class="grid">
      <div v-for="band in bands" :key="band._id" class="card" @click="goToBand(band)">
        <img
          class="cover"
          :src="band.coverImage && !brokenImages.has(band._id) ? band.coverImage : fallbackImage"
          :alt="band.name"
          loading="lazy"
          @error="markImageBroken(band._id)"
        />
        <div class="card-body">
          <h3>{{ band.name }}</h3>
          <div class="meta">
            <span class="chip" v-for="g in band.genre" :key="g">{{ g }}</span>
          </div>
          <p class="country">{{ band.country }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-page {
  max-width: var(--max);
  margin: 0 auto;
  padding: 84px var(--pad) 110px;
}

.list-page h1 {
  max-width: 720px;
  margin: 0 0 42px;
  font-family: var(--sans);
  font-size: clamp(52px, 8vw, 104px);
  line-height: 0.92;
  letter-spacing: -0.03em;
}

.status {
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px dotted var(--line);
  border-bottom: 1px dotted var(--line);
  color: var(--muted);
}

.status.error {
  color: var(--coral-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.card {
  border: 1px solid var(--ink);
  background: var(--paper);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  border-color: var(--coral);
}

.cover {
  width: 100%;
  height: 230px;
  border-bottom: 1px solid var(--ink);
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 18px;
}

.card-body h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.chip {
  padding: 4px 9px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.country {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

@media (max-width: 480px) {
  .list-page {
    padding: 58px 18px 72px;
  }
  .list-page h1 {
    font-size: 54px;
    margin-bottom: 24px;
  }
  /* minmax 的最小值从 240px 降到 140px，避免在很窄的手机屏幕上
     单列卡片本身就比屏幕宽，导致出现横向滚动条 */
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .cover {
    height: 170px;
  }
  .card-body {
    padding: 12px;
  }
  .card-body h3 {
    font-size: 15px;
  }
}
</style>
