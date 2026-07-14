<script setup>
// AlbumCard：展示一张专辑的封面/信息，点击可以展开/收起曲目列表
import { ref } from 'vue'
import { useMusicPlayer } from '../composables/useMusicPlayer.js'
import fallbackImage from '../assets/generated/rockweb-work-cover.png'

const props = defineProps({
  album: {
    type: Object,
    required: true,
  },
  band: {
    type: Object,
    default: null,
  },
})

const expanded = ref(false)
const imageFailed = ref(false)
const { currentTrackKey, isPlaying, getTrackKey, playTrack } = useMusicPlayer()

function toggle() {
  expanded.value = !expanded.value
}

function trackContext() {
  return {
    albumId: props.album._id,
    albumTitle: props.album.title || '未命名专辑',
    bandName: props.band?.name || props.album.band?.name || '未知乐队',
  }
}

function isActiveTrack(track) {
  return currentTrackKey.value === getTrackKey(track, trackContext())
}

function selectTrack(track) {
  playTrack(track, trackContext())
}
</script>

<template>
  <div class="album-card">
    <div class="album-header" @click="toggle">
      <img
        class="cover"
        :src="album.coverUrl && !imageFailed ? album.coverUrl : fallbackImage"
        :alt="album.title"
        @error="imageFailed = true"
      />
      <div class="info">
        <h4>{{ album.title }}</h4>
        <p class="year" v-if="album.releaseYear">{{ album.releaseYear }} 年发行</p>
        <p class="desc">{{ album.description }}</p>
      </div>
      <span class="arrow" :class="{ open: expanded }">⌄</span>
    </div>

    <div v-if="expanded" class="tracklist">
      <div v-if="!album.tracks || album.tracks.length === 0" class="empty">
        暂无收录的曲目信息
      </div>
      <div
        v-for="track in album.tracks"
        :key="track._id || track.title"
        class="track"
        :class="{ active: isActiveTrack(track) }"
      >
        <div class="track-row">
          <div>
            <span class="track-title">{{ track.title }}</span>
            <span v-if="isActiveTrack(track)" class="now-playing">
              {{ track.audioUrl && isPlaying ? '正在播放' : '当前曲目' }}
            </span>
          </div>
          <span class="track-duration">{{ track.duration }}</span>
        </div>

        <button
          v-if="track.audioUrl || track.embedUrl"
          class="track-play-button"
          type="button"
          @click="selectTrack(track)"
        >
          <span aria-hidden="true">{{ isActiveTrack(track) && track.audioUrl && isPlaying ? '❚❚' : '▶' }}</span>
          {{ isActiveTrack(track) && track.audioUrl && isPlaying ? '暂停' : '在悬浮播放器中播放' }}
        </button>
        <p v-else class="no-preview">暂无试听链接</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--ink);
  background: var(--paper);
}

.album-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
}

.cover {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border: 1px solid var(--ink);
  object-fit: cover;
}

.info {
  min-width: 0;
  flex: 1;
}

.info h4 {
  margin: 0 0 4px;
  font-size: 20px;
}

.year {
  margin: 0 0 4px;
  color: var(--coral-text);
  font-size: 13px;
}

.desc {
  margin: 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  flex-shrink: 0;
  color: var(--muted);
  font-size: 20px;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.tracklist {
  padding: 8px 16px 16px;
  border-top: 1px dotted var(--line);
}

.track {
  padding: 12px 0;
  border-bottom: 1px dotted var(--line);
}

.track.active {
  color: #fff;
}

.track:last-child {
  border-bottom: none;
}

.track-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.track-title {
  font-size: 15px;
}

.now-playing {
  margin-left: 9px;
  color: var(--coral-text);
  font-size: 11px;
  font-weight: 700;
}

.track-duration {
  color: var(--muted);
  font-size: 13px;
}

.track-play-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.track-play-button:hover {
  border-color: var(--coral);
  background: var(--coral);
}

.no-preview,
.empty {
  color: var(--muted);
  font-size: 13px;
}

.no-preview {
  margin: 0;
}

.empty {
  padding: 8px 0;
}

@media (max-width: 480px) {
  .album-header {
    gap: 12px;
    padding: 12px;
  }

  .cover {
    width: 52px;
    height: 52px;
  }

  .info h4 {
    font-size: 15px;
  }

  .desc {
    font-size: 13px;
  }

  .track-title {
    font-size: 14px;
  }
}
</style>
