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
  // 每首曲目多了两个"仅用于表单交互"的临时字段：
  // neteaseShareUrl（粘贴的分享链接）、neteaseSongId（识别/编辑出的歌曲ID）
  // 这两个不会存进数据库，提交前会转换成 embedUrl / embedPlatform
  tracks: [],
})

const bandOptions = ref([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

// 网易云分享链接常见形如 https://music.163.com/song?id=411314659&uct2=xxx，
// 也可能是 App 分享出来的 https://music.163.com/#/song?id=xxx；
// 优先匹配 ?id= 或 &id= 这种查询参数写法，匹配不到再退而求其次，
// 抓取链接末尾的一段连续数字（兼容 /song/12345 这种纯路径写法）
function extractIdFromShareUrl(url) {
  const text = url || ''
  const queryMatch = text.match(/[?&]id=(\d+)/)
  if (queryMatch) return queryMatch[1]
  const pathMatch = text.match(/(\d{5,})/)
  return pathMatch ? pathMatch[1] : ''
}

// 根据当前的 neteaseSongId 自动拼出网易云外链播放器地址，
// height=86 会显示完整控制栏（含音量滑条），方便用户自己拖动调节音量
function buildEmbedUrl(songId) {
  return `https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=86`
}

// 粘贴分享链接的输入框触发：解析出ID后同步更新 embedUrl/embedPlatform
function handleShareUrlInput(track) {
  const id = extractIdFromShareUrl(track.neteaseShareUrl)
  if (id) {
    track.neteaseSongId = id
    syncEmbedFromId(track)
  }
}

// 直接编辑ID输入框触发，或者提交前兜底调用一次，保证 embedUrl 始终和 ID 一致
function syncEmbedFromId(track) {
  if (track.neteaseSongId) {
    track.embedPlatform = '网易云音乐'
    track.embedUrl = buildEmbedUrl(track.neteaseSongId)
  }
}

// 编辑已有曲目时，从已存的 embedUrl 里反向解析出 ID，让输入框里能看到当前值
function parseIdFromExistingEmbedUrl(track) {
  track.neteaseSongId = extractIdFromShareUrl(track.embedUrl) || ''
}

onMounted(async () => {
  try {
    bandOptions.value = await getAllBands()

    if (isEditMode.value) {
      const data = await getAlbumById(albumId)
      const tracks = (data.tracks || []).map((t) => ({
        ...t,
        neteaseShareUrl: '',
        neteaseSongId: '',
      }))
      tracks.forEach(parseIdFromExistingEmbedUrl)

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
    title: '',
    duration: '',
    neteaseShareUrl: '',
    neteaseSongId: '',
    embedPlatform: '',
    embedUrl: '',
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
    // 提交前统一再同步一遍，防止用户手动改了ID输入框但没触发过 input 事件
    form.tracks.forEach(syncEmbedFromId)

    const payload = {
      ...form,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      // 表单专用的临时字段（neteaseShareUrl / neteaseSongId）不需要、也不应该传给后端，
      // 数据库的 Track schema 里没有这两个字段，只存 embedUrl / embedPlatform
      tracks: form.tracks.map(({ neteaseShareUrl, neteaseSongId, ...rest }) => rest),
    }

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

      <!-- 曲目列表：每条曲目占一整块 -->
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

          <!--
            智能网易云链接识别：
            粘贴分享链接（比如从网易云 APP/网页复制的 https://music.163.com/song?id=xxx&uct2=... ）
            会自动解析出数字ID填进右边的输入框，并自动拼出底层真正需要的 embedUrl，
            不用再自己去拼那一长串播放器地址
          -->
          <div class="netease-row">
            <input
              v-model="t.neteaseShareUrl"
              type="text"
              placeholder="粘贴网易云歌曲分享链接，自动识别歌曲ID"
              @input="handleShareUrlInput(t)"
            />
          </div>
          <div class="netease-row">
            <label class="inline-label">歌曲ID</label>
            <input
              v-model="t.neteaseSongId"
              type="text"
              placeholder="也可以直接在这里手动填写/修改ID"
              @input="syncEmbedFromId(t)"
            />
          </div>
          <p v-if="t.embedUrl" class="embed-preview">生成的播放器链接：{{ t.embedUrl }}</p>

          <!-- 音频上传是"备选路径"，跟上面的官方嵌入方案二选一或都填都行 -->
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

.status {
  color: #999;
}

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

.row input {
  flex: 1;
}

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

.field select option {
  background: #1a1a1c;
}

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

.inline-label {
  flex-shrink: 0;
  width: 56px;
  font-size: 12px;
  color: #999;
  margin: 0;
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

.add-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

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

.form-actions .primary:hover {
  background: #ff5b5b;
}

.form-actions .primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions .secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ccc;
}

.form-actions .secondary:hover {
  background: rgba(255, 255, 255, 0.06);
}
</style>
