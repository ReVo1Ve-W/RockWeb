import { computed, ref } from 'vue'

const DEFAULT_VOLUME = 0.8
const VOLUME_STORAGE_KEY = 'rockweb:player-volume'
const LAST_VOLUME_STORAGE_KEY = 'rockweb:player-last-volume'

function normalizeVolume(value, fallback = DEFAULT_VOLUME) {
  if (value === null || value === undefined || value === '') return fallback
  const parsedValue = Number(value)
  if (!Number.isFinite(parsedValue)) return fallback
  return Math.min(1, Math.max(0, parsedValue))
}

function readStoredVolume(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    return normalizeVolume(window.localStorage.getItem(key), fallback)
  } catch {
    return fallback
  }
}

function storeVolume(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // 浏览器禁用本地存储时，仍保留当前页面内的音量状态
  }
}

const storedVolume = readStoredVolume(VOLUME_STORAGE_KEY, DEFAULT_VOLUME)
const currentTrack = ref(null)
const trackContext = ref({})
const currentTrackKey = ref('')
const isPlaying = ref(false)
const volume = ref(storedVolume)
const lastNonZeroVolume = ref(
  readStoredVolume(
    LAST_VOLUME_STORAGE_KEY,
    storedVolume > 0 ? storedVolume : DEFAULT_VOLUME
  ) || DEFAULT_VOLUME
)

let audioElement = null

const sourceType = computed(() => {
  if (currentTrack.value?.audioUrl) return 'audio'
  if (currentTrack.value?.embedUrl) return 'embed'
  return ''
})

const isOpen = computed(() => !!currentTrack.value)
const isMuted = computed(() => volume.value === 0)

function getTrackKey(track, context = {}) {
  if (!track) return ''
  const albumId = context.albumId || track.albumId || 'album'
  const identity = track._id || track.audioUrl || track.embedUrl || track.title || 'track'
  return `${albumId}-${identity}`
}

function registerAudioElement(element) {
  audioElement = element
  if (audioElement) audioElement.volume = volume.value
}

function playTrack(track, context = {}) {
  if (!track?.audioUrl && !track?.embedUrl) return

  const nextKey = getTrackKey(track, context)
  if (nextKey === currentTrackKey.value) {
    if (sourceType.value === 'audio') togglePlayback()
    return
  }

  if (audioElement) audioElement.pause()
  isPlaying.value = false
  currentTrack.value = track
  trackContext.value = context
  currentTrackKey.value = nextKey
}

async function playAudio() {
  if (!audioElement || sourceType.value !== 'audio') return
  audioElement.volume = volume.value
  try {
    await audioElement.play()
  } catch (error) {
    isPlaying.value = false
    console.error('音频播放失败：', error)
  }
}

function togglePlayback() {
  if (!audioElement || sourceType.value !== 'audio') return
  if (audioElement.paused) playAudio()
  else audioElement.pause()
}

function setVolume(value) {
  const nextVolume = normalizeVolume(value)
  volume.value = nextVolume

  if (nextVolume > 0) {
    lastNonZeroVolume.value = nextVolume
    storeVolume(LAST_VOLUME_STORAGE_KEY, lastNonZeroVolume.value)
  }

  storeVolume(VOLUME_STORAGE_KEY, volume.value)
  if (audioElement) audioElement.volume = volume.value
}

function toggleMute() {
  if (isMuted.value) setVolume(lastNonZeroVolume.value || DEFAULT_VOLUME)
  else setVolume(0)
}

function closePlayer() {
  if (audioElement) {
    audioElement.pause()
    audioElement.removeAttribute('src')
    audioElement.load()
  }
  currentTrack.value = null
  trackContext.value = {}
  currentTrackKey.value = ''
  isPlaying.value = false
}

function markPlaying() {
  isPlaying.value = true
}

function markPaused() {
  isPlaying.value = false
}

export function useMusicPlayer() {
  return {
    currentTrack,
    trackContext,
    currentTrackKey,
    sourceType,
    isOpen,
    isPlaying,
    volume,
    isMuted,
    lastNonZeroVolume,
    getTrackKey,
    registerAudioElement,
    playTrack,
    playAudio,
    togglePlayback,
    setVolume,
    toggleMute,
    closePlayer,
    markPlaying,
    markPaused,
  }
}
