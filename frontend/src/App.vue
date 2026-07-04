<script setup>
// App.vue 现在是整个网站的"外壳"：放通用的顶部导航栏，
// 具体是首页还是详情页的内容，交给 <router-view> 根据当前网址自动渲染对应组件
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const siteName = ref('Rock Web')
const router = useRouter()
</script>

<template>
  <div class="page">
    <header class="site-header">
      <div class="brand" @click="router.push({ name: 'home' })">
        <h1>{{ siteName }}</h1>
        <span class="tagline">LOUD · RAW · LIVE</span>
      </div>
      <!--
        router-link 是 Vue Router 提供的"导航链接"组件，效果类似 <a>，
        但点击时是路由内部跳转（不刷新整页），并且当前所在页面会自动带上
        router-link-active 这个 class，方便用 CSS 做高亮
      -->
      <nav class="nav">
        <router-link :to="{ name: 'home' }">首页</router-link>
        <router-link :to="{ name: 'band-list' }">乐队</router-link>
        <router-link :to="{ name: 'album-list' }">专辑</router-link>
      </nav>
    </header>

    <!--
      router-view 是 Vue Router 提供的"占位组件"：
      当前网址匹配到哪个路由，这里就自动渲染对应的页面组件（Home.vue 或 BandDetail.vue）
    -->
    <router-view />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  /* 纯黑背景太平了，加一点暗红氛围光晕，营造 live house 的现场感 */
  background:
    radial-gradient(circle at 20% -10%, rgba(200, 30, 40, 0.25), transparent 60%),
    #0a0a0c;
  color: #f2f2f2;
  font-family: 'Inter', system-ui, sans-serif;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 56px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 16px;
  cursor: pointer;
}

.site-header h1 {
  margin: 0;
  /* Anton 是一款很"硬"的展示字体，专门用来放大标题制造冲击力 */
  font-family: 'Anton', sans-serif;
  font-size: 34px;
  /* 展示字体的字形偏高，line-height 太紧会导致上下被裁，1.3 留足呼吸空间 */
  line-height: 1.3;
  padding-top: 4px;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #ff3b3b, #ff9d3b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-size: 13px;
  letter-spacing: 3px;
  color: #888;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav a {
  color: #ddd;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.nav a:hover {
  color: #ff5b5b;
}

/* router-link-active 是 Vue Router 自动加给"当前所在页面"对应链接的 class，
   不用自己写代码判断"现在在哪个页面" */
.nav a.router-link-active {
  color: #ff5b5b;
}

@media (max-width: 720px) {
  .site-header {
    padding: 20px 24px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .nav {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .site-header {
    padding: 16px 18px;
  }
  .site-header h1 {
    font-size: 26px;
  }
  .tagline {
    font-size: 11px;
    letter-spacing: 2px;
  }
  .nav {
    gap: 16px;
    width: 100%;
  }
  .nav a {
    font-size: 14px;
  }
}
</style>
