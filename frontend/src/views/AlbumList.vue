<script setup>
// AlbumList.vue：展示全部专辑的卡片网格
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllAlbums } from '../api/albums.js'

const router = useRouter()
const albums = ref([])
const loading = ref(true)
const errorMessage = ref('')

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
</script>

<template>
  <div class="list-page">
    <h1>全部专辑</h1>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="albums.length === 0" class="status">暂无专辑数据</div>

    <div v-else class="grid">
      <div v-for="album in albums" :key="album._id" class="card" @click="goToBand(album)">
        <img class="cover" :src="album.coverUrl" :alt="album.title" />
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  height: 200px;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 16px;
}

.card-body h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.band-name {
  margin: 0 0 4px;
  font-size: 13px;
  color: #ff5b5b;
}

.year {
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
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 14px;
  }
  .cover {
    height: 150px;
  }
  .card-body {
    padding: 12px;
  }
  .card-body h3 {
    font-size: 14px;
  }
}
</style>
