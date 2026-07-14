<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FloatingMusicPlayer from './components/FloatingMusicPlayer.vue'

const route = useRoute()
const menuOpen = ref(false)
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div v-if="isAdminRoute" class="admin-shell">
    <router-view />
  </div>

  <div v-else class="site-shell">
    <div class="topline mono">
      <span>ROCK WEB / 在线音乐档案</span>
      <span>第 01 期 · 2026</span>
    </div>

    <header class="site-nav">
      <div class="wrap nav-inner">
        <router-link class="brand" :to="{ name: 'home' }" aria-label="返回 Rock Web 首页" @click="closeMenu">
          <span class="mark">Ø</span>
          <span class="brand-name">ROCK WEB</span>
        </router-link>

        <button
          class="menu-toggle"
          type="button"
          aria-label="打开导航"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span></span>
          <span></span>
        </button>

        <nav class="nav-links" :class="{ 'is-open': menuOpen }" aria-label="主要导航">
          <router-link :to="{ name: 'home' }" @click="closeMenu">首页</router-link>
          <router-link :to="{ name: 'band-list' }" @click="closeMenu">乐队</router-link>
          <router-link :to="{ name: 'album-list' }" @click="closeMenu">专辑</router-link>
          <router-link :to="{ name: 'home', hash: '#listen' }" @click="closeMenu">试听</router-link>
        </nav>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <FloatingMusicPlayer />
  </div>
</template>
