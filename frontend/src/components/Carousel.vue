<script setup>
// defineProps 声明"这个组件需要从外部接收哪些数据"
// 这里约定：父组件必须传一个叫 bands 的数组进来
const props = defineProps({
  bands: {
    type: Array,
    required: true,
  },
})

// defineEmits 声明"这个组件会向外触发哪些事件"
// select 事件用于告诉父组件"用户点击了某张幻灯片，想看这个乐队的详情"，
// 具体点击后要跳转到哪个页面，由父组件决定，Carousel 自己不关心
const emit = defineEmits(['select'])

import { ref, onUnmounted } from 'vue'

// currentIndex 记录"当前展示的是第几张图"，是响应式数据
const currentIndex = ref(0)

const AUTOPLAY_MS = 5000

// 切到下一张：如果已经是最后一张，就回到第一张（% 是取余数，实现"循环"效果）
function next() {
  currentIndex.value = (currentIndex.value + 1) % props.bands.length
  restartTimer()
}

// 切到上一张：如果已经是第一张，就跳到最后一张
function prev() {
  currentIndex.value =
    (currentIndex.value - 1 + props.bands.length) % props.bands.length
  restartTimer()
}

// 点击底部的小圆点，直接跳到对应的第几张
function goTo(index) {
  currentIndex.value = index
  restartTimer()
}

// 自动播放：每隔 AUTOPLAY_MS 自动切到下一张
let timer = setInterval(next, AUTOPLAY_MS)

// 手动点击箭头/圆点后，重新计时，避免"刚点完又立刻自动跳一次"的割裂感
function restartTimer() {
  clearInterval(timer)
  timer = setInterval(next, AUTOPLAY_MS)
}

// 组件销毁时清掉定时器，避免内存泄漏（这是个好习惯，先记住即可）
onUnmounted(() => clearInterval(timer))

// 点击幻灯片内容区域，触发 select 事件，把当前这个乐队的数据传出去
function selectBand(band) {
  emit('select', band)
}
</script>

<template>
  <div class="carousel">
    <!--
      v-for 是"循环渲染"指令：遍历 bands 数组，每一项生成一张幻灯片
      :key 是给每个元素一个唯一标识，帮助 Vue 高效地更新页面（Vue 内部优化用，必须写）
      :class 根据 index 是否等于 currentIndex，动态决定要不要加 "active" 这个 CSS 类
    -->
    <div
      v-for="(band, index) in bands"
      :key="band._id"
      class="slide"
      :class="{ active: index === currentIndex }"
    >
      <div
        class="bg"
        :class="{ active: index === currentIndex }"
        :style="{ backgroundImage: `url(${band.coverImage})` }"
      ></div>
      <div class="scrim"></div>

      <div class="content">
        <span class="index">0{{ index + 1 }} / 0{{ bands.length }}</span>
        <h2>{{ band.name }}</h2>
        <div class="meta">
          <!-- genre 在数据库里存的是数组（一个乐队可以有多个风格标签），
               用 v-for 把数组里每个标签渲染成一个独立的 chip -->
          <span class="chip" v-for="g in band.genre" :key="g">{{ g }}</span>
          <span class="country">{{ band.country }}</span>
        </div>
        <!-- @click 触发 selectBand，点击"查看详情"就会向父组件发出 select 事件 -->
        <button class="detail-btn" @click="selectBand(band)">查看详情 →</button>
      </div>
    </div>

    <!-- @click 是事件绑定：点击按钮时调用对应的函数 -->
    <button class="arrow left" @click="prev" aria-label="上一张">‹</button>
    <button class="arrow right" @click="next" aria-label="下一张">›</button>

    <div class="dots">
      <button
        v-for="(band, index) in bands"
        :key="band._id"
        class="dot"
        :class="{ active: index === currentIndex }"
        :aria-label="`跳转到 ${band.name}`"
        @click="goTo(index)"
      >
        <!-- 进度条：只在当前激活的圆点里播放动画，直观显示"还有多久自动切换" -->
        <span
          v-if="index === currentIndex"
          class="progress"
          :style="{ animationDuration: AUTOPLAY_MS + 'ms' }"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 580px;
  overflow: hidden;
  background: #000;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.8s ease-in-out;
}

.slide.active {
  opacity: 1;
  visibility: visible;
}

/* 背景图单独拆一层出来做 Ken Burns 缓慢缩放效果，让画面"活"起来，
   而不是死板的原地淡入淡出 */
.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.08);
  transition: transform 6s ease-out;
}

.bg.active {
  transform: scale(1);
}

/* 遮罩渐变：左侧和底部加深，让文字始终清晰可读，同时保留照片的冲击力 */
.scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 45%);
}

.content {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0 56px 56px;
  max-width: 640px;
  color: #fff;
}

.index {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  letter-spacing: 3px;
  color: #ff5b5b;
  font-weight: 600;
}

.content h2 {
  margin: 10px 0 16px;
  font-family: 'Anton', sans-serif;
  font-size: 64px;
  /* line-height: 1 会裁掉 Anton 这类展示字体的顶部/底部，改成 1.15 留出空间 */
  line-height: 1.15;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  /* flex-wrap：风格标签一多，窄屏放不下时自动换行，而不是把屏幕撑宽出现横向滚动条 */
  flex-wrap: wrap;
}

.chip {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  font-size: 13px;
  font-weight: 600;
}

.country {
  font-size: 14px;
  color: #bbb;
}

.detail-btn {
  margin-top: 24px;
  padding: 10px 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.detail-btn:hover {
  background: #ff3b3b;
  border-color: #ff3b3b;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  color: #fff;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s, transform 0.2s;
}

.arrow:hover {
  background: rgba(255, 59, 59, 0.85);
  transform: translateY(-50%) scale(1.08);
}

.arrow.left {
  left: 24px;
}

.arrow.right {
  right: 24px;
}

.dots {
  position: absolute;
  bottom: 24px;
  right: 32px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dot {
  position: relative;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
}

.dot.active {
  background: rgba(255, 255, 255, 0.3);
}

/* 进度条动画：从 0 宽度长到 100%，时长等于自动播放间隔，直观展示倒计时 */
.progress {
  position: absolute;
  inset: 0;
  background: #ff3b3b;
  width: 0%;
  animation-name: fill;
  animation-timing-function: linear;
}

@keyframes fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .carousel {
    height: 420px;
  }
  .content h2 {
    font-size: 36px;
  }
  .content {
    padding: 0 24px 32px;
  }
  /* 手机上箭头按钮占位太大、容易和标题重叠，先缩小尺寸 */
  .arrow {
    width: 38px;
    height: 38px;
    font-size: 20px;
  }
}

/* 480px 以下是常见手机竖屏宽度，再进一步收紧字号和留白，
   避免大字号在小屏幕上挤压掉可读性 */
@media (max-width: 480px) {
  .carousel {
    height: 380px;
  }
  .content {
    max-width: 100%;
    padding: 0 16px 24px;
  }
  .content h2 {
    font-size: 28px;
  }
  .index {
    font-size: 11px;
  }
  .chip {
    font-size: 11px;
    padding: 4px 10px;
  }
  .detail-btn {
    padding: 8px 18px;
    font-size: 13px;
  }
  .dots {
    right: 16px;
    bottom: 16px;
  }
  .dot {
    width: 24px;
  }
}
</style>
