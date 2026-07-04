<script setup>
// AdminLogin.vue：后台管理登录页
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../api/auth.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    const { token } = await login(username.value, password.value)
    // localStorage 是浏览器提供的本地存储，数据会一直留在浏览器里，
    // 即使关掉标签页、重启电脑也不会丢失（除非手动清除），
    // 适合存"登录凭证"这种需要长期保持登录状态的信息
    localStorage.setItem('admin_token', token)
    router.push({ name: 'admin-bands' })
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '登录失败，请检查网络连接'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleSubmit">
      <h1>后台管理登录</h1>
      <div class="field">
        <label>账号</label>
        <input v-model="username" type="text" autocomplete="username" required />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" required />
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="submitting">
        {{ submitting ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0c;
}

.login-card {
  width: 320px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.login-card h1 {
  margin: 0 0 24px;
  font-size: 20px;
  color: #f2f2f2;
  text-align: center;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #999;
}

.field input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f2f2f2;
  font-size: 14px;
  box-sizing: border-box;
}

.field input:focus {
  outline: none;
  border-color: #ff3b3b;
}

.error {
  margin: 0 0 16px;
  font-size: 13px;
  color: #ff6b6b;
}

button[type='submit'] {
  width: 100%;
  padding: 10px;
  background: #ff3b3b;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
