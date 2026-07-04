<script setup>
// <script setup> 是"逻辑区"：写数据和交互逻辑
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 引入我们自己写的轮播图组件 —— 组件的核心思想：把 UI 拆成一个个可复用的积木
import Carousel from '../components/Carousel.vue'
// 引入封装好的 API 请求函数
import { getFeaturedBands } from '../api/bands.js'

const router = useRouter()

// bands 一开始是空数组，等请求成功后才会被填充 —— 这是异步请求的典型写法：
// 页面先正常渲染出来（此时轮播图是空的），数据到达后 Vue 自动重新渲染
const bands = ref([])
const loading = ref(true)
const errorMessage = ref('')

// onMounted 是一个"生命周期钩子"：组件第一次被渲染到页面上之后，会自动执行里面的代码
// 用来做"页面刚打开就要执行一次"的事情，比如这里的"去后端要数据"
onMounted(async () => {
  try {
    // await 会让代码"等一下"，等这个网络请求真正有结果了才往下走，
    // 但不会卡住整个页面（这就是"异步"——页面其他部分照常能操作）
    bands.value = await getFeaturedBands()
  } catch (err) {
    // 常见失败原因：后端服务没启动、网络问题、MongoDB 连接断开
    console.error('获取乐队数据失败：', err)
    errorMessage.value = '暂时无法连接到后端服务，请确认后端是否已启动'
  } finally {
    loading.value = false
  }
})

// 轮播图点击某个乐队后，跳转到对应的详情页
// router.push 是"编程式导航"：用代码触发页面跳转，而不是靠 <a> 标签
function goToBand(band) {
  router.push({ name: 'band-detail', params: { id: band._id } })
}
</script>

<template>
  <!--
    v-if / v-else-if / v-else：根据不同状态显示不同内容
    这是处理"网络请求"必须考虑的三种状态：加载中、出错了、成功拿到数据
  -->
  <div v-if="loading" class="status">加载中...</div>
  <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
  <!--
    这就是 props：把 bands 数据通过 :bands="bands" "传"给子组件 Carousel
    @select 是监听子组件"触发"的自定义事件——点击某张幻灯片时 Carousel 会喊一声 "select"，
    这里用 @select="goToBand" 接住这声喊叫并执行跳转
  -->
  <Carousel v-else :bands="bands" @select="goToBand" />

  <section class="intro">
    <h3>精选乐队</h3>
    <p>这里记录着影响我最深的那些声音 —— 从主舞台的轮播开始，慢慢展开每一支乐队的故事。</p>
  </section>
</template>

<style scoped>
.status {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.status.error {
  color: #ff6b6b;
}

.intro {
  max-width: 720px;
  margin: 0 auto;
  padding: 72px 24px 96px;
  text-align: center;
}

.intro h3 {
  margin: 0 0 16px;
  font-family: 'Anton', sans-serif;
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
}

.intro p {
  margin: 0;
  color: #999;
  font-size: 16px;
  line-height: 1.7;
}

@media (max-width: 480px) {
  .intro {
    padding: 48px 20px 64px;
  }
  .intro h3 {
    font-size: 22px;
  }
  .intro p {
    font-size: 14px;
  }
}
</style>
