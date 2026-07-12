<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMusicPlayer } from '../composables/useMusicPlayer.js'

const {
  currentTrack,
  trackContext,
  currentTrackKey,
  sourceType,
  isOpen,
  isPlaying,
  volume,
  registerAudioElement,
  playAudio,
  togglePlayback,
  setVolume,
  closePlayer,
  markPlaying,
  markPaused,
} = useMusicPlayer()

const playerElement = ref(null)
const audioElement = ref(null)
const position = ref({ x: 0, y: 0 })
const hasCustomPosition = ref(false)
let dragState = null

function panelSize() {
  return {
    width: playerElement.value?.offsetWidth || Math.min(360, window.innerWidth - 24),
    height: playerElement.value?.offsetHeight || 220,
  }
}

function clampPosition(x, y) {
  const margin = window.innerWidth <= 560 ? 8 : 16
  const { width, height } = panelSize()
  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, window.innerWidth - width - margin)),
    y: Math.min(Math.max(margin, y), Math.max(margin, window.innerHeight - height - margin)),
  }
}

function placeAtDefault() {
  const margin = window.innerWidth <= 560 ? 8 : 24
  const { width } = panelSize()
  position.value = clampPosition(window.innerWidth - width - margin, Math.max(88, window.innerHeight * 0.2))
}

function keepInViewport() {
  if (!isOpen.value) return
  if (hasCustomPosition.value) position.value = clampPosition(position.value.x, position.value.y)
  else placeAtDefault()
}

function startDrag(event) {
  if (event.button !== undefined && event.button !== 0) return
  hasCustomPosition.value = true
  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: position.value.x,
    originY: position.value.y,
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function moveDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return
  position.value = clampPosition(
    dragState.originX + event.clientX - dragState.startX,
    dragState.originY + event.clientY - dragState.startY
  )
}

function stopDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return
  dragState = null
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}

function updateVolume(event) {
  setVolume(event.target.value)
}

watch(currentTrackKey, async () => {
  if (!isOpen.value) return
  await nextTick()
  if (!hasCustomPosition.value) placeAtDefault()
  else keepInViewport()

  if (sourceType.value === 'audio' && audioElement.value) {
    registerAudioElement(audioElement.value)
    audioElement.value.load()
    playAudio()
  }
})

watch(audioElement, (element) => registerAudioElement(element))

onMounted(() => window.addEventListener('resize', keepInViewport))
onBeforeUnmount(() => window.removeEventListener('resize', keepInViewport))
</script>

<template>
  <aside
    v-if="isOpen"
    ref="playerElement"
    class="floating-player"
    :class="{ 'embed-player': sourceType === 'embed' }"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    aria-label="悬浮音乐播放器"
  >
    <div
      class="drag-handle"
      title="拖动播放器"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <span class="grip" aria-hidden="true">⠿</span>
      <div class="track-info">
        <strong>{{ currentTrack.title || '未命名曲目' }}</strong>
        <small>
          {{ trackContext.bandName || '未知乐队' }}
          <template v-if="trackContext.albumTitle"> · {{ trackContext.albumTitle }}</template>
        </small>
      </div>
      <button class="close-button" type="button" aria-label="关闭播放器" @pointerdown.stop @click="closePlayer">
        ×
      </button>
    </div>

    <div v-if="sourceType === 'audio'" class="native-controls">
      <audio
        ref="audioElement"
        :src="currentTrack.audioUrl"
        preload="metadata"
        @play="markPlaying"
        @pause="markPaused"
        @ended="markPaused"
      ></audio>
      <button class="play-button" type="button" :aria-label="isPlaying ? '暂停' : '播放'" @click="togglePlayback">
        {{ isPlaying ? '❚❚' : '▶' }}
      </button>
      <div class="volume-control">
        <span aria-hidden="true">♪</span>
        <label class="sr-only" for="global-player-volume">音量</label>
        <input
          id="global-player-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          @input="updateVolume"
        />
        <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
      </div>
    </div>

    <div v-else class="embed-controls">
      <p>请使用官方播放器控制播放；可用功能由音乐平台决定。</p>
      <iframe
        :src="currentTrack.embedUrl"
        :title="`${currentTrack.title || '曲目'}官方播放器`"
        frameborder="0"
        allow="autoplay; encrypted-media"
      ></iframe>
    </div>
  </aside>
</template>

<style scoped>
.floating-player {
  position: fixed;
  z-index: 1000;
  width: min(360px, calc(100vw - 24px));
  overflow: hidden;
  border: 1px solid rgba(255, 113, 94, 0.38);
  border-radius: 16px;
  background: rgba(16, 14, 18, 0.96);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.48);
  color: #fff;
  backdrop-filter: blur(18px);
}

.drag-handle {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(110deg, rgba(213, 41, 48, 0.28), rgba(255, 133, 61, 0.08));
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.grip {
  color: rgba(255, 255, 255, 0.42);
  font-size: 20px;
}

.track-info {
  min-width: 0;
}

.track-info strong,
.track-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-info strong {
  font-size: 14px;
  line-height: 1.4;
}

.track-info small {
  margin-top: 2px;
  color: #aaa5ac;
  font-size: 11px;
}

.close-button,
.play-button {
  display: grid;
  place-items: center;
  border: 0;
  color: #fff;
  cursor: pointer;
}

.close-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  font-size: 20px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.16);
}

.native-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
}

.play-button {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #ff8b3d);
  box-shadow: 0 8px 24px rgba(214, 42, 48, 0.32);
  font-size: 16px;
}

.volume-control {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: auto minmax(80px, 1fr) 38px;
  align-items: center;
  gap: 8px;
  color: #c9c5ca;
  font-size: 12px;
}

.volume-control input {
  width: 100%;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.volume-value {
  color: #8f8a92;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.embed-controls {
  padding: 11px 12px 13px;
}

.embed-controls p {
  margin: 0 0 9px;
  color: #928d95;
  font-size: 11px;
  line-height: 1.5;
}

.embed-controls iframe {
  display: block;
  width: 100%;
  height: 86px;
  border-radius: 9px;
  background: #111;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 560px) {
  .floating-player {
    width: calc(100vw - 16px);
    border-radius: 14px;
  }

  .drag-handle {
    padding: 10px;
  }

  .native-controls {
    padding: 14px;
  }

  .embed-controls iframe {
    height: 80px;
  }
}
</style>
