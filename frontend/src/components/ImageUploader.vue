<script setup>
// ImageUploader.vue：通用的图片上传组件
// 用法：<ImageUploader v-model="form.avatar" />
// 效果：显示当前图片的预览（如果有），一个"选择文件上传"按钮，
// 以及一个备选的手动输入链接框（万一你已经有现成的图片网址，不想重新上传）
import { ref } from 'vue'
import { uploadImage } from '../api/upload.js'

// defineModel 是 Vue 3.4+ 提供的简化写法，让这个组件能直接用 v-model 双向绑定，
// 效果等同于手写 defineProps(['modelValue']) + defineEmits(['update:modelValue'])
const modelValue = defineModel()

const uploading = ref(false)
const errorMessage = ref('')
const fileInput = ref(null) // 拿到 <input type="file"> 这个 DOM 元素的引用

function triggerFileSelect() {
  fileInput.value.click()
}

async function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  errorMessage.value = ''
  uploading.value = true
  try {
    const { url } = await uploadImage(file)
    modelValue.value = url
  } catch (err) {
    errorMessage.value = '上传失败：' + (err.response?.data?.message || err.message)
  } finally {
    uploading.value = false
    // 清空 input 的值，这样下次选择同一个文件也能正常触发 change 事件
    event.target.value = ''
  }
}
</script>

<template>
  <div class="uploader">
    <div class="preview-row">
      <!-- 有图片链接时显示缩略图预览，方便确认上传/填写的是不是想要的那张图 -->
      <img v-if="modelValue" :src="modelValue" class="preview" alt="预览图" />
      <div v-else class="preview placeholder">无图片</div>

      <div class="actions">
        <button type="button" @click="triggerFileSelect" :disabled="uploading">
          {{ uploading ? '上传中...' : '选择文件上传' }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleFileChange"
        />
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 保留手动输入链接的备选方式，不强制所有图片都要重新上传一遍 -->
    <input
      v-model="modelValue"
      type="text"
      class="url-input"
      placeholder="或直接粘贴图片链接 https://..."
    />
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
}

.preview.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #666;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.actions button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
}

.actions button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.error {
  margin: 0;
  font-size: 12px;
  color: #ff6b6b;
}

.url-input {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 13px;
  box-sizing: border-box;
}

.url-input:focus {
  outline: none;
  border-color: #ff3b3b;
}
</style>
