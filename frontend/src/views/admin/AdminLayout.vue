<script setup>
// AdminLayout.vue：后台管理的外壳，提供侧边导航 + 退出登录，
// 具体是"乐队管理"还是"专辑管理"的内容通过 <router-view> 渲染
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('admin_token')
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h2>后台管理</h2>
      <nav>
        <router-link :to="{ name: 'admin-bands' }">乐队管理</router-link>
        <router-link :to="{ name: 'admin-albums' }">专辑管理</router-link>
      </nav>
      <button class="back-site" @click="router.push({ name: 'home' })">← 返回网站</button>
      <button class="logout" @click="logout">退出登录</button>
    </aside>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: #0a0a0c;
  color: #f2f2f2;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  padding: 24px 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar h2 {
  font-size: 16px;
  margin: 0 0 24px;
  padding: 0 8px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar nav a {
  padding: 10px 12px;
  border-radius: 8px;
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
}

.sidebar nav a:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sidebar nav a.router-link-active {
  background: rgba(255, 59, 59, 0.15);
  color: #ff5b5b;
}

.back-site,
.logout {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
}

.back-site:hover {
  background: rgba(255, 255, 255, 0.06);
}

.logout:hover {
  background: rgba(255, 59, 59, 0.15);
  border-color: rgba(255, 59, 59, 0.4);
  color: #ff5b5b;
}

.admin-content {
  flex: 1;
  padding: 32px;
  overflow-x: auto;
}
</style>
