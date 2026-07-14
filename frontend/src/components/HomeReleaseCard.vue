<script setup>
import { ref } from 'vue'
import fallbackImage from '../assets/generated/rockweb-work-cover.png'

const props = defineProps({
  album: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])
const imageFailed = ref(false)

function selectAlbum() {
  if (props.album?.band?._id) emit('select', props.album)
}
</script>

<template>
  <article class="release-card" :class="{ interactive: album?.band?._id }">
    <button
      v-if="album?.band?._id"
      class="card-action"
      type="button"
      :aria-label="`查看 ${album.title || '这张专辑'} 所属乐队`"
      @click="selectAlbum"
    ></button>

    <div class="cover" :class="{ fallback: !album.coverUrl || imageFailed }">
      <img
        v-if="album.coverUrl && !imageFailed"
        :src="album.coverUrl"
        :alt="`${album.title || '专辑'}封面`"
        loading="lazy"
        @error="imageFailed = true"
      />
      <img v-else :src="fallbackImage" :alt="`${album.title || '专辑'}默认封面`" loading="lazy" />
      <span v-if="album.releaseYear" class="year">{{ album.releaseYear }}</span>
    </div>

    <div class="body">
      <p class="band-name">{{ album.band?.name || '未知乐队' }}</p>
      <h3>{{ album.title || '未命名专辑' }}</h3>
      <p class="description">{{ album.description || '这张唱片的故事，等待你从音乐中慢慢发现。' }}</p>
      <span v-if="album?.band?._id" class="more">进入乐队档案 <span aria-hidden="true">↗</span></span>
    </div>
  </article>
</template>

<style scoped>
.release-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--ink);
  background: var(--paper);
  transition: border-color 0.25s, transform 0.25s, background 0.25s;
}

.release-card.interactive:hover {
  border-color: var(--coral);
  background: var(--paper-2);
  transform: translateY(-5px);
}

.card-action {
  position: absolute;
  inset: 0;
  z-index: 3;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  cursor: pointer;
}

.cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--paper-2);
  border-bottom: 1px solid var(--ink);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.release-card.interactive:hover .cover img {
  transform: scale(1.035);
}

.cover.fallback {
  display: grid;
  place-items: center;
}

.cover.fallback > span:first-child {
  color: rgba(29, 27, 26, 0.18);
  font-family: var(--sans);
  font-size: clamp(56px, 7vw, 92px);
  letter-spacing: 0.06em;
}

.year {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 5px 9px;
  border: 1px solid var(--paper);
  background: var(--ink);
  color: var(--paper);
  font-size: 11px;
  font-weight: 750;
}

.body {
  padding: 18px 18px 20px;
}

.band-name {
  margin: 0 0 7px;
  color: var(--coral-text);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--ink);
  font-size: 19px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  display: -webkit-box;
  min-height: 44px;
  margin: 12px 0 17px;
  overflow: hidden;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.more {
  color: var(--ink);
  font-size: 12px;
  font-weight: 700;
}

.release-card.interactive:hover .more {
  color: var(--coral-text);
}

@media (max-width: 560px) {
  .body {
    padding: 15px;
  }

  h3 {
    font-size: 17px;
  }
}
</style>
