<script setup>
// AlbumCard：展示一张专辑的封面/信息，点击可以展开/收起曲目列表
import { ref } from 'vue'
import { useMusicPlayer } from '../composables/useMusicPlayer.js'

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
      <img class="cover" :src="album.coverUrl" :alt="album.title" />
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
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
  border-radius: 8px;
  object-fit: cover;
}

.info {
  min-width: 0;
  flex: 1;
}

.info h4 {
  margin: 0 0 4px;
  font-size: 17px;
}

.year {
  margin: 0 0 4px;
  color: #ff5b5b;
  font-size: 13px;
}

.desc {
  margin: 0;
  overflow: hidden;
  color: #999;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  flex-shrink: 0;
  color: #999;
  font-size: 20px;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.tracklist {
  padding: 8px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.track {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  color: var(--color-accent-light);
  font-size: 11px;
  font-weight: 700;
}

.track-duration {
  color: #777;
  font-size: 13px;
}

.track-play-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 91, 91, 0.28);
  border-radius: 999px;
  background: rgba(255, 59, 59, 0.09);
  color: #f5e9eb;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.track-play-button:hover {
  border-color: rgba(255, 91, 91, 0.6);
  background: rgba(255, 59, 59, 0.16);
}

.no-preview,
.empty {
  color: #666;
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
