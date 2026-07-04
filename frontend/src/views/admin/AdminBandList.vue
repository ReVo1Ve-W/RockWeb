<script setup>
// AdminBandList.vue：后台"乐队管理"列表页
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllBands, deleteBand } from '../../api/bands.js'

const router = useRouter()
const bands = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function loadBands() {
  loading.value = true
  try {
    bands.value = await getAllBands()
  } catch (err) {
    errorMessage.value = '加载失败：' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadBands)

async function handleDelete(band) {
  // confirm() 是浏览器自带的原生确认弹窗，用户点"取消"时 confirm 返回 false，
  // 直接 return 掉，不会继续往下执行删除操作——这是"删除前二次确认"最简单的实现方式
  if (!confirm(`确定要删除乐队"${band.name}"吗？关联的专辑数据不会自动删除，需要手动处理。`)) {
    return
  }
  try {
    await deleteBand(band._id)
    // 删除成功后重新拉一次列表，保证页面显示的是数据库最新状态
    await loadBands()
  } catch (err) {
    alert('删除失败：' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>乐队管理</h1>
      <button class="primary" @click="router.push({ name: 'admin-band-new' })">+ 新增乐队</button>
    </div>

    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="bands.length === 0" class="status">暂无乐队，点击"新增乐队"开始添加</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>名称</th>
          <th>风格</th>
          <th>国家</th>
          <th>首页展示</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="band in bands" :key="band._id">
          <td>{{ band.name }}</td>
          <td>{{ band.genre?.join('、') || '-' }}</td>
          <td>{{ band.country || '-' }}</td>
          <td>{{ band.isFeatured ? '是' : '否' }}</td>
          <td class="actions">
            <button @click="router.push({ name: 'admin-band-edit', params: { id: band._id } })">编辑</button>
            <button class="danger" @click="handleDelete(band)">删除</button>
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
