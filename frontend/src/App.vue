<script setup>
import { ref } from 'vue'
import FloatingMusicPlayer from './components/FloatingMusicPlayer.vue'

const siteName = ref('Rock Web')
</script>

<template>
  <div class="page">
    <header class="site-header">
      <router-link class="brand" :to="{ name: 'home' }" aria-label="返回 Rock Web 首页">
        <h1>{{ siteName }}</h1>
        <span class="tagline">LOUD · RAW · LIVE</span>
      </router-link>

      <nav class="nav" aria-label="主要导航">
        <router-link :to="{ name: 'home' }">首页</router-link>
        <router-link :to="{ name: 'band-list' }">乐队</router-link>
        <router-link :to="{ name: 'album-list' }">专辑</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <FloatingMusicPlayer />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% -10%, rgba(200, 30, 40, 0.25), transparent 58%),
    var(--color-bg);
  color: var(--color-text);
}

.site-header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 24px clamp(24px, 4vw, 56px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);
  background: rgba(9, 9, 11, 0.78);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 16px;
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
}

.site-header h1 {
  margin: 0;
  padding-top: 4px;
  font-family: 'Anton', sans-serif;
  font-size: 34px;
  line-height: 1.3;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--color-accent), #ff9d3b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav a {
  padding: 9px 13px;
  border-radius: 999px;
  color: #d8d7da;
  text-decoration: none;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.5px;
  transition: color 0.2s, background 0.2s;
}

.nav a:hover,
.nav a.router-link-active {
  color: #fff;
  background: rgba(255, 59, 59, 0.14);
}

@media (max-width: 720px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 17px 24px;
  }

  .nav {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .site-header {
    padding: 14px 18px;
  }

  .brand {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }

  .site-header h1 {
    font-size: 27px;
  }

  .tagline {
    font-size: 10px;
    letter-spacing: 2.2px;
  }

  .nav {
    width: 100%;
    gap: 4px;
  }

  .nav a {
    padding: 8px 11px;
    font-size: 13px;
  }
}
</style>
