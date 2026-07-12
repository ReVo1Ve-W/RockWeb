<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  bands: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select'])

const AUTOPLAY_MS = 5000
const currentIndex = ref(0)
const isHovered = ref(false)
const isFocusWithin = ref(false)
const isDocumentHidden = ref(false)
const prefersReducedMotion = ref(false)
const brokenImages = ref(new Set())
let timer = null
let motionQuery = null

const safeBands = computed(() => (Array.isArray(props.bands) ? props.bands : []))
const canAutoplay = computed(
  () =>
    safeBands.value.length > 1 &&
    !isHovered.value &&
    !isFocusWithin.value &&
    !isDocumentHidden.value &&
    !prefersReducedMotion.value
)

function clearTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  clearTimer()
  if (canAutoplay.value) {
    timer = window.setInterval(() => move(1, false), AUTOPLAY_MS)
  }
}

function move(direction, restart = true) {
  const total = safeBands.value.length
  if (total < 2) return
  currentIndex.value = (currentIndex.value + direction + total) % total
  if (restart) startTimer()
}

function next() {
  move(1)
}

function prev() {
  move(-1)
}

function goTo(index) {
  if (index < 0 || index >= safeBands.value.length) return
  currentIndex.value = index
  startTimer()
}

function selectBand(band) {
  if (band?._id) emit('select', band)
}

function markImageBroken(index) {
  brokenImages.value = new Set([...brokenImages.value, index])
}

function onVisibilityChange() {
  isDocumentHidden.value = document.hidden
}

function onMotionChange(event) {
  prefersReducedMotion.value = event.matches
}

function handleFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isFocusWithin.value = false
  }
}

watch(
  () => safeBands.value.length,
  (length) => {
    if (!length) currentIndex.value = 0
    else if (currentIndex.value >= length) currentIndex.value = length - 1
    startTimer()
  },
  { immediate: true }
)

watch(canAutoplay, startTimer)

onMounted(() => {
  isDocumentHidden.value = document.hidden
  document.addEventListener('visibilitychange', onVisibilityChange)
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQuery.matches
  motionQuery.addEventListener?.('change', onMotionChange)
  startTimer()
})

onUnmounted(() => {
  clearTimer()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  motionQuery?.removeEventListener?.('change', onMotionChange)
})
</script>

<template>
  <section
    class="carousel"
    aria-label="精选乐队"
    aria-roledescription="轮播图"
    tabindex="-1"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="isFocusWithin = true"
    @focusout="handleFocusOut"
  >
    <article
      v-for="(band, index) in safeBands"
      :key="band._id || index"
      class="slide"
      :class="{ active: index === currentIndex }"
      :aria-hidden="index !== currentIndex"
      aria-roledescription="幻灯片"
      :aria-label="`${index + 1} / ${safeBands.length}：${band.name || '未命名乐队'}`"
    >
      <div class="visual" :class="{ fallback: !band.coverImage || brokenImages.has(index) }">
        <img
          v-if="band.coverImage && !brokenImages.has(index)"
          class="bg"
          :class="{ active: index === currentIndex }"
          :src="band.coverImage"
          :alt="`${band.name || '乐队'}封面`"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          @error="markImageBroken(index)"
        />
      </div>
      <div class="scrim"></div>

      <div class="content">
        <span class="index">
          {{ String(index + 1).padStart(2, '0') }} / {{ String(safeBands.length).padStart(2, '0') }}
        </span>
        <p class="eyebrow">FEATURED ARTIST</p>
        <h2>{{ band.name || '未命名乐队' }}</h2>
        <div class="meta">
          <span v-for="genre in (Array.isArray(band.genre) ? band.genre : [])" :key="genre" class="chip">
            {{ genre }}
          </span>
          <span v-if="band.country" class="country">{{ band.country }}</span>
        </div>
        <button v-if="band._id" class="detail-btn" @click="selectBand(band)">
          阅读乐队故事 <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>

    <template v-if="safeBands.length > 1">
      <button class="arrow left" type="button" aria-label="上一支乐队" @click="prev">‹</button>
      <button class="arrow right" type="button" aria-label="下一支乐队" @click="next">›</button>

      <div class="dots" aria-label="选择精选乐队">
        <button
          v-for="(band, index) in safeBands"
          :key="band._id || index"
          class="dot"
          :class="{ active: index === currentIndex }"
          type="button"
          :aria-label="`显示 ${band.name || `第 ${index + 1} 支乐队`}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          @click="goTo(index)"
        >
          <span
            v-if="index === currentIndex"
            class="progress"
            :class="{ paused: !canAutoplay }"
            :style="{ animationDuration: `${AUTOPLAY_MS}ms` }"
          ></span>
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: min(650px, calc(100vh - 88px));
  min-height: 520px;
  overflow: hidden;
  background: #09090b;
  border-bottom: 1px solid var(--color-border);
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

.visual,
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.visual {
  overflow: hidden;
  background:
    radial-gradient(circle at 72% 25%, rgba(255, 90, 56, 0.36), transparent 30%),
    linear-gradient(135deg, #3d0b12 0%, #171015 46%, #09090b 100%);
}

.visual.fallback::after {
  content: 'ROCK WEB';
  position: absolute;
  right: 6%;
  bottom: 7%;
  color: rgba(255, 255, 255, 0.045);
  font-family: 'Anton', sans-serif;
  font-size: clamp(72px, 14vw, 210px);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.bg {
  object-fit: cover;
  object-position: center;
  transform: scale(1.07);
  transition: transform 6s ease-out;
}

.bg.active {
  transform: scale(1);
}

.scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(5, 5, 7, 0.92) 0%, rgba(5, 5, 7, 0.52) 44%, rgba(5, 5, 7, 0.12) 78%),
    linear-gradient(to top, rgba(5, 5, 7, 0.86) 0%, transparent 54%);
}

.content {
  position: absolute;
  left: max(56px, calc((100% - var(--content-width)) / 2));
  bottom: 64px;
  width: min(680px, calc(100% - 112px));
  color: #fff;
}

.index,
.eyebrow {
  color: var(--color-accent-light);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
}

.eyebrow {
  display: inline-block;
  margin: 18px 0 0;
  padding-left: 42px;
  position: relative;
}

.eyebrow::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 30px;
  height: 1px;
  background: currentColor;
}

.content h2 {
  margin: 8px 0 18px;
  font-family: 'Anton', sans-serif;
  font-size: clamp(52px, 6.5vw, 92px);
  line-height: 1.08;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-wrap: balance;
  text-shadow: 0 5px 30px rgba(0, 0, 0, 0.52);
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  padding: 6px 13px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  font-size: 12px;
  font-weight: 700;
}

.country {
  color: #c3c1c5;
  font-size: 13px;
}

.detail-btn {
  margin-top: 28px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: rgba(9, 9, 11, 0.24);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.04em;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.detail-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-accent);
  transform: translateY(-2px);
}

.arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: rgba(9, 9, 11, 0.36);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  font-size: 25px;
  transition: background 0.2s, transform 0.2s;
}

.arrow:hover {
  background: rgba(255, 59, 59, 0.88);
  transform: translateY(-50%) scale(1.06);
}

.arrow.left { left: 22px; }
.arrow.right { right: 22px; }

.dots {
  position: absolute;
  right: max(32px, calc((100% - var(--content-width)) / 2));
  bottom: 30px;
  z-index: 2;
  display: flex;
  gap: 8px;
}

.dot {
  position: relative;
  width: 38px;
  height: 4px;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.28);
  cursor: pointer;
}

.progress {
  position: absolute;
  inset: 0;
  width: 0;
  background: var(--color-accent);
  animation: fill linear;
}

.progress.paused {
  animation-play-state: paused;
}

@keyframes fill {
  to { width: 100%; }
}

@media (max-width: 720px) {
  .carousel {
    height: 520px;
    min-height: 0;
  }

  .content {
    left: 24px;
    bottom: 72px;
    width: calc(100% - 48px);
  }

  .content h2 {
    font-size: clamp(38px, 10vw, 58px);
  }

  .arrow {
    top: 42%;
    width: 38px;
    height: 38px;
    font-size: 20px;
  }

  .arrow.left { left: 12px; }
  .arrow.right { right: 12px; }

  .dots {
    right: auto;
    bottom: 28px;
    left: 24px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 500px;
  }

  .scrim {
    background:
      linear-gradient(to top, rgba(5, 5, 7, 0.96) 0%, rgba(5, 5, 7, 0.48) 62%, rgba(5, 5, 7, 0.08) 100%),
      linear-gradient(90deg, rgba(5, 5, 7, 0.42), transparent);
  }

  .content {
    left: 18px;
    bottom: 70px;
    width: calc(100% - 36px);
  }

  .content h2 {
    margin-bottom: 14px;
    font-size: clamp(34px, 12vw, 48px);
  }

  .eyebrow {
    margin-top: 12px;
  }

  .chip {
    padding: 5px 10px;
    font-size: 11px;
  }

  .detail-btn {
    margin-top: 20px;
    padding: 10px 16px;
  }

  .dots {
    left: 18px;
    bottom: 26px;
  }

  .dot {
    width: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg,
  .bg.active {
    transform: none;
  }
}
</style>
