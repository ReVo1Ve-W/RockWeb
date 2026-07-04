<script setup>
// AlbumCard：展示一张专辑的封面/信息，点击可以展开/收起曲目列表
import { ref } from 'vue'

const props = defineProps({
  album: {
    type: Object,
    required: true,
  },
})

// expanded 控制这张专辑的曲目列表是"展开"还是"收起"，默认收起，减少页面初始信息量
const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
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
      <!-- :class 根据 expanded 状态旋转箭头图标，视觉上提示"展开/收起" -->
      <span class="arrow" :class="{ open: expanded }">⌄</span>
    </div>

    <!-- v-if 而不是 v-show：曲目列表收起时直接不渲染，省去不必要的 DOM 节点 -->
    <div v-if="expanded" class="tracklist">
      <div v-if="!album.tracks || album.tracks.length === 0" class="empty">
        暂无收录的曲目信息
      </div>
      <div v-for="track in album.tracks" :key="track.title" class="track">
        <div class="track-row">
          <span class="track-title">{{ track.title }}</span>
          <span class="track-duration">{{ track.duration }}</span>
        </div>

        <!--
          版权合规的试听方案：只有 embedUrl 真的填了才渲染播放器，
          否则显示一句提示文字，而不是嵌入一个指向空地址的 iframe（会报错或显示空白）
          iframe 里嵌的是第三方平台（网易云音乐/QQ音乐/YouTube等）官方提供的播放器，
          音频文件本身始终在对方服务器上播放，不涉及我们自己存储或分发音频
        -->
        <iframe
          v-if="track.embedUrl"
          class="player"
          :src="track.embedUrl"
          frameborder="0"
          allow="autoplay"
        ></iframe>
        <p v-else class="no-preview">暂无试听链接</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
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
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.info h4 {
  margin: 0 0 4px;
  font-size: 17px;
}

.year {
  margin: 0 0 4px;
  font-size: 13px;
  color: #ff5b5b;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  font-size: 20px;
  color: #999;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.arrow.open {
  transform: rotate(180deg);
}

.tracklist {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px 16px;
}

.track {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.track:last-child {
  border-bottom: none;
}

.track-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.track-title {
  font-size: 15px;
}

.track-duration {
  font-size: 13px;
  color: #777;
}

.player {
  width: 100%;
  height: 86px;
  border-radius: 8px;
}

.no-preview {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.empty {
  color: #666;
  font-size: 13px;
  padding: 8px 0;
}

@media (max-width: 480px) {
  .album-header {
    padding: 12px;
    gap: 12px;
  }
  .cover {
    width: 52px;
    height: 52px;
  }
  .info h4 {
    font-size: 15px;
  }
  .desc {
    /* 手机上宽度更紧张，长描述容易把标题挤没，缩短显示长度 */
    font-size: 13px;
  }
  .track-title {
    font-size: 14px;
  }
  .player {
    height: 80px;
  }
}
</style>
