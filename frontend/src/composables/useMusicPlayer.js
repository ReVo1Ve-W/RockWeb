import { computed, ref } from 'vue'

const currentTrack = ref(null)
const trackContext = ref({})
const currentTrackKey = ref('')
const isPlaying = ref(false)
const volume = ref(0.8)

let audioElement = null

const sourceType = computed(() => {
  if (currentTrack.value?.audioUrl) return 'audio'
  if (currentTrack.value?.embedUrl) return 'embed'
  return ''
})

const isOpen = computed(() => !!currentTrack.value)

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
  const nextVolume = Math.min(1, Math.max(0, Number(value)))
  volume.value = Number.isFinite(nextVolume) ? nextVolume : 0.8
  if (audioElement) audioElement.volume = volume.value
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
    getTrackKey,
    registerAudioElement,
    playTrack,
    playAudio,
    togglePlayback,
    setVolume,
    closePlayer,
    markPlaying,
    markPaused,
  }
}
