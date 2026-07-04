<script setup>
// AdminBandForm.vue：乐队的新增/编辑表单。
// 同一个组件同时承担"新增"和"编辑"两种场景：
// 通过路由是否带 :id 参数来判断，这样两个功能不用写两份几乎一样的表单代码
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBandById, createBand, updateBand } from '../../api/bands.js'

const route = useRoute()
const router = useRouter()

// route.params.id 存在就是"编辑模式"，不存在就是"新增模式"
const bandId = route.params.id
const isEditMode = computed(() => !!bandId)

// reactive() 和之前用的 ref() 类似，都是让数据变成"响应式"的，
// 区别是 reactive 更适合包一整个对象（表单数据通常是对象），
// 用起来不用像 ref 那样每次都写 .value
const form = reactive({
  name: '',
  nameEn: '',
  avatar: '',
  coverImage: '',
  country: '',
  formedYear: '',
  bio: '',
  isFeatured: false,
  genre: [], // 风格标签数组，比如 ['独立摇滚', 'Grunge']
  members: [], // 成员数组，每项是 { name, role }
})

const newGenreTag = ref('') // 输入框里正在打的新标签文字，还没确认加进 genre 数组
const loading = ref(isEditMode.value) // 新增模式不用等加载，直接可以填表单
const submitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  if (!isEditMode.value) return
  try {
    const data = await getBandById(bandId)
    // Object.assign 把从后端拿到的数据"覆盖"进 form，这样表单里就会显示已有的信息，
    // 而不是空白的（编辑场景应该看到当前已存的内容）
    Object.assign(form, {
      name: data.name || '',
      nameEn: data.nameEn || '',
      avatar: data.avatar || '',
      coverImage: data.coverImage || '',
      country: data.country || '',
      formedYear: data.formedYear || '',
      bio: data.bio || '',
      isFeatured: data.isFeatured || false,
      genre: data.genre || [],
      members: data.members || [],
    })
  } catch (err) {
    errorMessage.value = '加载乐队数据失败：' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
})

// 按回车或点"添加"按钮，把输入框里的文字变成一个新的风格标签
function addGenreTag() {
  const tag = newGenreTag.value.trim()
  if (tag && !form.genre.includes(tag)) {
    form.genre.push(tag)
  }
  newGenreTag.value = ''
}

function removeGenreTag(index) {
  form.genre.splice(index, 1)
}

// 添加一个空的成员条目，用户再填名字和分工
function addMember() {
  form.members.push({ name: '', role: '' })
}

function removeMember(index) {
  form.members.splice(index, 1)
}

async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    // formedYear 表单里存的是字符串（输入框天然给出字符串），
    // 提交给后端前转成数字，符合 Mongoose Schema 里 Number 类型的要求；
    // 用户没填的话就是空字符串，转成 undefined 表示"没有这个字段"，而不是错误的 0
    const payload = {
      ...form,
      formedYear: form.formedYear ? Number(form.formedYear) : undefined,
    }

    if (isEditMode.value) {
      await updateBand(bandId, payload)
    } else {
      await createBand(payload)
    }
    router.push({ name: 'admin-bands' })
  } catch (err) {
    errorMessage.value = '保存失败：' + (err.response?.data?.message || err.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="admin-page">
    <h1>{{ isEditMode ? '编辑乐队' : '新增乐队' }}</h1>

    <div v-if="loading" class="status">加载中...</div>

    <form v-else class="form" @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="field">
        <label>乐队名称 *</label>
        <input v-model="form.name" type="text" required />
      </div>

      <div class="field">
        <label>英文名</label>
        <input v-model="form.nameEn" type="text" />
      </div>

      <div class="row">
        <div class="field">
          <label>国家/地区</label>
          <input v-model="form.country" type="text" />
        </div>
        <div class="field">
          <label>成立年份</label>
          <input v-model="form.formedYear" type="number" />
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>头像图片链接</label>
          <input v-model="form.avatar" type="text" placeholder="https://..." />
        </div>
        <div class="field">
          <label>首页轮播大图链接</label>
          <input v-model="form.coverImage" type="text" placeholder="https://..." />
        </div>
      </div>

      <div class="field">
        <label>乐队简介</label>
        <textarea v-model="form.bio" rows="4"></textarea>
      </div>

      <!-- 风格标签：动态列表，输入后按 Enter 或点"添加"变成一个标签 -->
      <div class="field">
        <label>风格标签</label>
        <div class="tag-input">
          <input
            v-model="newGenreTag"
            type="text"
            placeholder="输入后按 Enter 添加"
            @keydown.enter.prevent="addGenreTag"
          />
          <button type="button" @click="addGenreTag">添加</button>
        </div>
        <div class="tag-list">
          <span v-for="(g, i) in form.genre" :key="g" class="tag">
            {{ g }}
            <button type="button" class="tag-remove" @click="removeGenreTag(i)">×</button>
          </span>
        </div>
      </div>

      <!-- 成员列表：动态列表，每条是"姓名 + 分工"两个输入框 -->
      <div class="field">
        <label>乐队成员</label>
        <div v-for="(m, i) in form.members" :key="i" class="member-row">
          <input v-model="m.name" type="text" placeholder="姓名" />
          <input v-model="m.role" type="text" placeholder="分工，如：主唱/吉他" />
          <button type="button" class="remove-btn" @click="removeMember(i)">删除</button>
        </div>
        <button type="button" class="add-btn" @click="addMember">+ 添加成员</button>
      </div>

      <div class="field checkbox-field">
        <label>
          <input v-model="form.isFeatured" type="checkbox" />
          在首页轮播图展示
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="secondary" @click="router.push({ name: 'admin-bands' })">
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

.row .field {
  flex: 1;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #999;
}

.field input[type='text'],
.field input[type='number'],
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
.field textarea:focus {
  outline: none;
  border-color: #ff3b3b;
}

.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ddd;
  font-size: 14px;
  cursor: pointer;
}

.tag-input {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-input input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 13px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 12px;
  border-radius: 999px;
  background: rgba(255, 59, 59, 0.15);
  color: #ff8080;
  font-size: 13px;
}

.tag-remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #ff8080;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}

.tag-remove:hover {
  background: rgba(255, 59, 59, 0.3);
}

.member-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.member-row input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 13px;
}

.add-btn,
.remove-btn,
.tag-input button {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.add-btn:hover,
.tag-input button:hover {
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
