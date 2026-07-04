<script setup>
// BandList.vue：展示全部乐队的卡片网格
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllBands } from '../api/bands.js'

const router = useRouter()
const bands = ref([])
const loading = ref(true)
const errorMessage = ref('')

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
</script>

<template>
  <div class="list-page">
    <h1>全部乐队</h1>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="bands.length === 0" class="status">暂无乐队数据</div>

    <div v-else class="grid">
      <div v-for="band in bands" :key="band._id" class="card" @click="goToBand(band)">
        <img class="cover" :src="band.coverImage" :alt="band.name" />
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 96px;
}

.list-page h1 {
  font-family: 'Anton', sans-serif;
  font-size: 32px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 32px;
}

.status {
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.status.error {
  color: #ff6b6b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 59, 59, 0.5);
}

.cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 16px;
}

.card-body h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.chip {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
}

.country {
  margin: 0;
  font-size: 13px;
  color: #999;
}

@media (max-width: 480px) {
  .list-page {
    padding: 16px 16px 64px;
  }
  .list-page h1 {
    font-size: 24px;
    margin-bottom: 24px;
  }
  /* minmax 的最小值从 240px 降到 140px，避免在很窄的手机屏幕上
     单列卡片本身就比屏幕宽，导致出现横向滚动条 */
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
  }
  .cover {
    height: 120px;
  }
  .card-body {
    padding: 12px;
  }
  .card-body h3 {
    font-size: 15px;
  }
}
</style>
