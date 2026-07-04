<script setup>
// AudioUploader.vue：曲目的本地音频文件上传组件
//
// ⚠️ 版权提醒：这个组件只应该用来上传你自己拥有权利的音频内容
// （比如自己翻唱、乐队官方释出的免费试听片段等）。正式发行的歌曲版权
// 属于原作者/唱片公司，不能自己存文件分发——那种情况应该用
// embedPlatform + embedUrl 字段，通过网易云音乐/QQ音乐等官方播放器合法嵌入，
// 而不是走这个上传通道。
import { ref } from 'vue'
import { uploadAudio } from '../api/upload.js'

const modelValue = defineModel()

const uploading = ref(false)
const errorMessage = ref('')
const fileInput = ref(null)

function triggerFileSelect() {
  fileInput.value.click()
}

async function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  errorMessage.value = ''
  uploading.value = true
  try {
    const { url } = await uploadAudio(file)
    modelValue.value = url
  } catch (err) {
    errorMessage.value = '上传失败：' + (err.response?.data?.message || err.message)
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

function clearAudio() {
  modelValue.value = ''
}
</script>

<template>
  <div class="uploader">
    <p class="warning">⚠️ 仅上传你确认拥有权利的音频（自己翻唱/官方免费释出片段等），正式发行歌曲请用下方的"官方播放器嵌入"</p>

    <div v-if="modelValue" class="current-audio">
      <audio :src="modelValue" controls class="audio-player"></audio>
      <button type="button" class="remove-btn" @click="clearAudio">移除</button>
    </div>

    <div v-else class="actions">
      <button type="button" @click="triggerFileSelect" :disabled="uploading">
        {{ uploading ? '上传中...' : '选择音频文件上传' }}
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="audio/*"
        class="hidden-input"
        @change="handleFileChange"
      />
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning {
  margin: 0;
  padding: 8px 10px;
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 6px;
  color: #ffc107;
  font-size: 12px;
  line-height: 1.5;
}

.current-audio {
  display: flex;
  align-items: center;
  gap: 12px;
}

.audio-player {
  flex: 1;
  height: 36px;
}

.actions button,
.remove-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.actions button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.remove-btn:hover {
  background: rgba(255, 59, 59, 0.15);
  border-color: rgba(255, 59, 59, 0.4);
  color: #ff5b5b;
}

.hidden-input {
  display: none;
}

.error {
  margin: 0;
  font-size: 12px;
  color: #ff6b6b;
}
</style>
