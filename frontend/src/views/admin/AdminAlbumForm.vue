<script setup>
// AdminAlbumForm.vue：专辑的新增/编辑表单
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAlbumById, createAlbum, updateAlbum } from '../../api/albums.js'
import { getAllBands } from '../../api/bands.js'
import ImageUploader from '../../components/ImageUploader.vue'
import AudioUploader from '../../components/AudioUploader.vue'

const route = useRoute()
const router = useRouter()

const albumId = route.params.id
const isEditMode = computed(() => !!albumId)

const form = reactive({
  band: '',
  title: '',
  coverUrl: '',
  releaseYear: '',
  description: '',
  tracks: [], // 每项是 { title, duration, neteaseSongId, neteaseShareUrl, embedPlatform, embedUrl, audioUrl }
})

const bandOptions = ref([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

// 网易云分享链接格式：https://music.163.com/song?id=411314659&uct2=...
// 正则把 id= 后面的数字提取出来赋值给 neteaseSongId，再自动拼出 embedUrl 和填入 Platform
function extractNeteaseId(track) {
  const url = track.neteaseShareUrl || ''
  const match = url.match(/[?&]id=(\d+)/)
  if (match) {
    track.neteaseSongId = match[1]
  }
  syncFromId(track)
}

// 手动改动歌曲ID输入框时，自动同步生成 embedUrl 和 embedPlatform
function syncFromId(track) {
  const id = track.neteaseSongId || ''
  if (id) {
    track.embedPlatform = '网易云音乐'
    track.embedUrl = `https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=86`
  }
}

// 把已有 embedUrl 里的 ID 反向解析到 neteaseSongId（编辑模式加载时用）
function parseExistingEmbedUrl(track) {
  if (!track.embedUrl) return
  const match = track.embedUrl.match(/[?&]id=(\d+)/)
  if (match) {
    track.neteaseSongId = match[1]
  }
}

onMounted(async () => {
  try {
    bandOptions.value = await getAllBands()

    if (isEditMode.value) {
      const data = await getAlbumById(albumId)
      const tracks = (data.tracks || []).map(t => ({
        ...t,
        neteaseSongId: '',
        neteaseShareUrl: '',
      }))
      tracks.forEach(parseExistingEmbedUrl)
      Object.assign(form, {
        band: data.band?._id || data.band || '',
        title: data.title || '',
        coverUrl: data.coverUrl || '',
        releaseYear: data.releaseYear || '',
        description: data.description || '',
        tracks,
      })
    }
  } catch (err) {
    errorMessage.value = '加载数据失败：' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
})

function addTrack() {
  form.tracks.push({
    title: '', duration: '',
    neteaseSongId: '', neteaseShareUrl: '',
    embedPlatform: '', embedUrl: '',
    audioUrl: '',
  })
}

function removeTrack(index) {
  form.tracks.splice(index, 1)
}

async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    // 提交前再跑一次同步，防止用户手动改了 ID 但没有触发输入事件
    form.tracks.forEach(syncFromId)

    const payload = {
      ...form,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
    }
    // 提交时把仅用于表单的临时字段删掉，不传给后端
    payload.tracks = payload.tracks.map(t => {
      const { neteaseSongId, neteaseShareUrl, ...rest } = t
      return rest
    })

    if (isEditMode.value) {
      await updateAlbum(albumId, payload)
    } else {
      await createAlbum(payload)
    }
    router.push({ name: 'admin-albums' })
  } catch (err) {
    errorMessage.value = '保存失败：' + (err.response?.data?.message || err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="admin-page">
    <h1>{{ isEditMode ? '编辑专辑' : '新增专辑' }}</h1>

    <div v-if="loading" class="status">加载中...</div>

    <form v-else class="form" @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="field">
        <label>所属乐队 *</label>
        <select v-model="form.band" required>
          <option value="" disabled>请选择乐队</option>
          <option v-for="b in bandOptions" :key="b._id" :value="b._id">{{ b.name }}</option>
        </select>
      </div>

      <div class="field">
        <label>专辑名称 *</label>
        <input v-model="form.title" type="text" required />
      </div>

      <div class="row">
        <div class="field">
          <label>发行年份</label>
          <input v-model="form.releaseYear" type="number" />
        </div>
        <div class="field">
          <label>封面图</label>
          <ImageUploader v-model="form.coverUrl" />
        </div>
      </div>

      <div class="field">
        <label>专辑简介</label>
        <textarea v-model="form.description" rows="3"></textarea>
      </div>

      <div class="field">
        <label>曲目列表</label>
        <div v-for="(t, i) in form.tracks" :key="i" class="track-block">
          <div class="track-block-header">
            <span>曲目 {{ i + 1 }}</span>
            <button type="button" class="remove-btn" @click="removeTrack(i)">删除</button>
          </div>
          <div class="row">
            <input v-model="t.title" type="text" placeholder="曲目名" />
            <input v-model="t.duration" type="text" placeholder="时长，如 3:45" />
          </div>

          <!-- 网易云音乐智能链接输入区 -->
          <div class="netease-row">
            <input
              v-model="t.neteaseShareUrl"
              type="text"
              placeholder="粘贴网易云歌曲分享链接，自动识别ID"
              @input="extractNeteaseId(t)"
            />
            <span class="arrow-icon">→</span>
            <input
              v-model="t.neteaseSongId"
              type="text"
              placeholder="歌曲ID"
              class="id-input"
              @input="syncFromId(t)"
            />
          </div>
          <p v-if="t.embedUrl" class="embed-preview">{{ t.embedUrl }}</p>

          <AudioUploader v-model="t.audioUrl" />
        </div>
        <button type="button" class="add-btn" @click="addTrack">+ 添加曲目</button>
      </div>

      <div class="form-actions">
        <button type="button" class="secondary" @click="router.push({ name: 'admin-albums' })">
          取消
        </button>
        <button type="submit" class="primary" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 640px;
}

.admin-page h1 {
  font-size: 22px;
  margin: 0 0 24px;
}

.status { color: #999; }

.error {
  color: #ff6b6b;
  font-size: 13px;
  margin: 0 0 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.row {
  display: flex;
  gap: 16px;
}

.row input { flex: 1; }

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #999;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #ff3b3b;
}

.field select option { background: #1a1a1c; }

.track-block {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.track-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
}

/* 网易云智能入口区：分享链接 → 解析 → 歌曲ID */
.netease-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.netease-row input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 13px;
}

.netease-row .id-input {
  flex: 0 0 120px;
}

.arrow-icon {
  color: #ff5b5b;
  font-size: 18px;
  flex-shrink: 0;
}

.embed-preview {
  margin: 0;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.add-btn,
.remove-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
}

.add-btn {
  padding: 8px 14px;
  align-self: flex-start;
}

.add-btn:hover { background: rgba(255, 255, 255, 0.06); }

.remove-btn:hover {
  background: rgba(255, 59, 59, 0.15);
  border-color: rgba(255, 59, 59, 0.4);
  color: #ff5b5b;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions button {
  padding: 10px 24px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.form-actions .primary {
  background: #ff3b3b;
  color: #fff;
}

.form-actions .primary:hover { background: #ff5b5b; }

.form-actions .primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions .secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ccc;
}

.form-actions .secondary:hover { background: rgba(255, 255, 255, 0.06); }
</style>
