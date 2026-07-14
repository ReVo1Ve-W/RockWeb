<script setup>
// AlbumList.vue：展示全部专辑的卡片网格
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllAlbums } from '../api/albums.js'
import fallbackImage from '../assets/generated/rockweb-work-cover.png'

const router = useRouter()
const albums = ref([])
const loading = ref(true)
const errorMessage = ref('')
const brokenImages = ref(new Set())

onMounted(async () => {
  try {
    albums.value = await getAllAlbums()
  } catch (err) {
    console.error('获取专辑列表失败：', err)
    errorMessage.value = '暂时无法加载专辑列表，请确认后端服务是否正常'
  } finally {
    loading.value = false
  }
})

// 后端用 .populate('band', 'name') 把 album.band 从纯 id 换成了 { _id, name } 对象，
// 所以这里能直接拿到 album.band.name 和 album.band._id
function goToBand(album) {
  if (album.band?._id) {
    router.push({ name: 'band-detail', params: { id: album.band._id } })
  }
}

function markImageBroken(id) {
  brokenImages.value = new Set([...brokenImages.value, id])
}
</script>

<template>
  <div class="list-page">
    <h1>全部专辑</h1>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="albums.length === 0" class="status">暂无专辑数据</div>

    <div v-else class="grid">
      <div v-for="album in albums" :key="album._id" class="card" @click="goToBand(album)">
        <img
          class="cover"
          :src="album.coverUrl && !brokenImages.has(album._id) ? album.coverUrl : fallbackImage"
          :alt="album.title"
          loading="lazy"
          @error="markImageBroken(album._id)"
        />
        <div class="card-body">
          <h3>{{ album.title }}</h3>
          <p class="band-name" v-if="album.band">{{ album.band.name }}</p>
          <p class="year" v-if="album.releaseYear">{{ album.releaseYear }} 年发行</p>
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
  height: 280px;
  border-bottom: 1px solid var(--ink);
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 18px;
}

.card-body h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.band-name {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--coral-text);
}

.year {
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
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .cover {
    height: 210px;
  }
  .card-body {
    padding: 12px;
  }
  .card-body h3 {
    font-size: 14px;
  }
}
</style>
