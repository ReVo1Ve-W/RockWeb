<script setup>
// AdminAlbumList.vue：后台"专辑管理"列表页
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllAlbums, deleteAlbum } from '../../api/albums.js'

const router = useRouter()
const albums = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function loadAlbums() {
  loading.value = true
  try {
    albums.value = await getAllAlbums()
  } catch (err) {
    errorMessage.value = '加载失败：' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadAlbums)

async function handleDelete(album) {
  if (!confirm(`确定要删除专辑"${album.title}"吗？`)) return
  try {
    await deleteAlbum(album._id)
    await loadAlbums()
  } catch (err) {
    alert('删除失败：' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>专辑管理</h1>
      <button class="primary" @click="router.push({ name: 'admin-album-new' })">+ 新增专辑</button>
    </div>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="albums.length === 0" class="status">暂无专辑，点击"新增专辑"开始添加</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>专辑名称</th>
          <th>所属乐队</th>
          <th>发行年份</th>
          <th>曲目数</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="album in albums" :key="album._id">
          <td>{{ album.title }}</td>
          <td>{{ album.band?.name || '(乐队已被删除)' }}</td>
          <td>{{ album.releaseYear || '-' }}</td>
          <td>{{ album.tracks?.length || 0 }}</td>
          <td class="actions">
            <button @click="router.push({ name: 'admin-album-edit', params: { id: album._id } })">编辑</button>
            <button class="danger" @click="handleDelete(album)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 960px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  margin: 0;
}

.status {
  color: #999;
  padding: 24px 0;
}

.status.error {
  color: #ff6b6b;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-table th {
  color: #999;
  font-weight: 600;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
}

button:hover {
  background: rgba(255, 255, 255, 0.06);
}

button.primary {
  background: #ff3b3b;
  border-color: #ff3b3b;
  color: #fff;
  font-weight: 600;
}

button.primary:hover {
  background: #ff5b5b;
}

button.danger:hover {
  background: rgba(255, 59, 59, 0.15);
  border-color: rgba(255, 59, 59, 0.4);
  color: #ff5b5b;
}
</style>
