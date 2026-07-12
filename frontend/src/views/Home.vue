<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Carousel from '../components/Carousel.vue'
import HomeReleaseCard from '../components/HomeReleaseCard.vue'
import { getFeaturedBands } from '../api/bands.js'
import { getAllAlbums } from '../api/albums.js'
import { useMusicPlayer } from '../composables/useMusicPlayer.js'

const router = useRouter()
const bands = ref([])
const albums = ref([])
const heroLoading = ref(true)
const releasesLoading = ref(true)
const heroError = ref('')
const releasesError = ref('')
const { currentTrackKey, isPlaying, getTrackKey, playTrack } = useMusicPlayer()

const latestReleases = computed(() =>
  [...albums.value]
    .sort((a, b) => {
      const aYear = Number(a?.releaseYear)
      const bYear = Number(b?.releaseYear)
      const aHasYear = Number.isFinite(aYear) && aYear > 0
      const bHasYear = Number.isFinite(bYear) && bYear > 0
      if (aHasYear !== bHasYear) return aHasYear ? -1 : 1
      if (aHasYear && aYear !== bYear) return bYear - aYear
      return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
    })
    .slice(0, 6)
)

const playableTracks = computed(() => {
  const picks = []
  for (const album of albums.value) {
    const track = Array.isArray(album?.tracks)
      ? album.tracks.find((item) => item?.embedUrl || item?.audioUrl)
      : null
    if (track) {
      picks.push({
        ...track,
        albumId: album._id,
        albumTitle: album.title || '未命名专辑',
        bandName: album.band?.name || '未知乐队',
        bandId: album.band?._id,
      })
    }
    if (picks.length === 4) break
  }
  return picks
})

async function loadBands() {
  heroLoading.value = true
  heroError.value = ''
  try {
    const data = await getFeaturedBands()
    bands.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取精选乐队失败：', error)
    heroError.value = '精选乐队暂时离线，请稍后重试。'
  } finally {
    heroLoading.value = false
  }
}

async function loadAlbums() {
  releasesLoading.value = true
  releasesError.value = ''
  try {
    const data = await getAllAlbums()
    albums.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取专辑数据失败：', error)
    releasesError.value = '唱片档案暂时无法读取，请稍后重试。'
  } finally {
    releasesLoading.value = false
  }
}

function goToBand(band) {
  if (band?._id) router.push({ name: 'band-detail', params: { id: band._id } })
}

function goToAlbumBand(album) {
  if (album?.band?._id) router.push({ name: 'band-detail', params: { id: album.band._id } })
}

function trackContext(track) {
  return {
    albumId: track.albumId,
    albumTitle: track.albumTitle,
    bandName: track.bandName,
  }
}

function trackKey(track) {
  return getTrackKey(track, trackContext(track))
}

function isActiveTrack(track) {
  return currentTrackKey.value === trackKey(track)
}

function selectTrack(track) {
  playTrack(track, trackContext(track))
}

onMounted(() => {
  loadBands()
  loadAlbums()
})
</script>

<template>
  <div class="home">
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="hero-heading">
        <div>
          <p class="section-kicker">ROCK WEB · ISSUE 01</p>
          <h1 id="hero-title">那些让夜晚<br />保持清醒的声音</h1>
        </div>
        <p class="hero-copy">
          从华语独立摇滚出发，收藏乐队、唱片与可以反复回到的瞬间。
        </p>
      </div>

      <div v-if="heroLoading" class="hero-placeholder" aria-label="正在加载精选乐队">
        <span>正在布置舞台...</span>
      </div>
      <div v-else-if="heroError" class="state-card hero-state">
        <p>{{ heroError }}</p>
        <button type="button" @click="loadBands">重新连接</button>
      </div>
      <div v-else-if="!bands.length" class="state-card hero-state">
        <p>舞台还没有设置精选乐队。</p>
        <router-link :to="{ name: 'band-list' }">浏览全部乐队</router-link>
      </div>
      <Carousel v-else :bands="bands" @select="goToBand" />
    </section>

    <section class="editorial-section releases" aria-labelledby="releases-title">
      <div class="section-heading">
        <div>
          <p class="section-kicker">NEW IN THE ARCHIVE</p>
          <h2 id="releases-title">最新发行</h2>
          <p>从刚刚入库的唱片开始，沿着封面与年份重新发现熟悉的声音。</p>
        </div>
        <router-link class="text-link" :to="{ name: 'album-list' }">查看全部专辑 →</router-link>
      </div>

      <div v-if="releasesLoading" class="release-grid" aria-label="正在加载专辑">
        <div v-for="index in 6" :key="index" class="release-skeleton"></div>
      </div>
      <div v-else-if="releasesError" class="state-card compact-state">
        <p>{{ releasesError }}</p>
        <button type="button" @click="loadAlbums">重新读取</button>
      </div>
      <div v-else-if="latestReleases.length" class="release-grid">
        <HomeReleaseCard
          v-for="album in latestReleases"
          :key="album._id"
          :album="album"
          @select="goToAlbumBand"
        />
      </div>
      <div v-else class="state-card compact-state">
        <p>档案中还没有专辑，第一张唱片正在路上。</p>
      </div>
    </section>

    <section v-if="!releasesLoading && !releasesError" class="listening-section" aria-labelledby="listening-title">
      <div class="listening-copy">
        <p class="section-kicker">LISTEN TONIGHT</p>
        <h2 id="listening-title">今夜试听</h2>
        <p>挑一首歌放进全局播放器，边听边继续浏览。</p>
        <router-link class="text-link" :to="{ name: 'band-list' }">探索全部乐队 →</router-link>
      </div>

      <div v-if="playableTracks.length" class="track-list">
        <article
          v-for="(track, index) in playableTracks"
          :key="trackKey(track)"
          class="track-item"
          :class="{ active: isActiveTrack(track) }"
        >
          <button class="track-summary" type="button" @click="selectTrack(track)">
            <span class="track-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="track-main">
              <strong>{{ track.title || '未命名曲目' }}</strong>
              <small>{{ track.bandName }} · {{ track.albumTitle }}</small>
            </span>
            <span v-if="track.duration" class="duration">{{ track.duration }}</span>
            <span class="play-icon" aria-hidden="true">
              {{ isActiveTrack(track) && track.audioUrl && isPlaying ? '❚❚' : '▶' }}
            </span>
          </button>
        </article>
      </div>
      <div v-else class="state-card listening-empty">
        <p>当前还没有可试听曲目，可以先去乐队档案看看。</p>
      </div>
    </section>

    <section class="explore-section" aria-labelledby="explore-title">
      <div>
        <p class="section-kicker">KEEP DIGGING</p>
        <h2 id="explore-title">继续翻唱片，<br />也继续认识乐队。</h2>
      </div>
      <div class="explore-actions">
        <router-link class="primary-link" :to="{ name: 'band-list' }">进入乐队档案</router-link>
        <router-link class="secondary-link" :to="{ name: 'album-list' }">浏览唱片收藏</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 88px;
}

.hero-section {
  padding-top: 48px;
}

.hero-heading,
.editorial-section,
.listening-section,
.explore-section {
  width: min(var(--content-width), calc(100% - 48px));
  margin-inline: auto;
}

.hero-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.75fr);
  align-items: end;
  gap: 48px;
  padding: 0 0 40px;
}

.section-kicker {
  margin: 0 0 13px;
  color: var(--color-accent-light);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.22em;
}

.hero-heading h1,
.section-heading h2,
.listening-copy h2,
.explore-section h2 {
  margin: 0;
  color: #fff;
  font-family: 'Anton', sans-serif;
  font-weight: 400;
  letter-spacing: 0.015em;
  text-transform: uppercase;
}

.hero-heading h1 {
  font-size: clamp(46px, 6.2vw, 86px);
  line-height: 1.03;
}

.hero-copy {
  max-width: 370px;
  margin: 0 0 6px;
  color: var(--color-text-soft);
  font-size: 15px;
  line-height: 1.85;
}

.hero-section :deep(.carousel),
.hero-placeholder,
.hero-state {
  width: min(1440px, calc(100% - 32px));
  margin-inline: auto;
  border-radius: var(--radius-lg);
}

.hero-section :deep(.carousel) {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.hero-placeholder {
  display: grid;
  min-height: 540px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background:
    linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.055) 40%, transparent 60%) 0 0 / 220% 100%,
    radial-gradient(circle at 70% 25%, rgba(255, 59, 59, 0.22), transparent 30%),
    #111115;
  animation: shimmer 1.8s infinite linear;
  color: var(--color-text-muted);
  font-size: 13px;
  letter-spacing: 0.12em;
}

@keyframes shimmer {
  to { background-position: -220% 0, center, center; }
}

.editorial-section {
  padding: 112px 0 0;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 34px;
}

.section-heading h2,
.listening-copy h2 {
  font-size: clamp(36px, 4.2vw, 58px);
  line-height: 1.08;
}

.section-heading > div > p:last-child,
.listening-copy > p:nth-of-type(2) {
  max-width: 570px;
  margin: 13px 0 0;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.75;
}

.text-link {
  flex: none;
  padding: 8px 0;
  color: #e8e7e9;
  text-decoration: none;
  font-size: 13px;
  font-weight: 750;
}

.text-link:hover {
  color: var(--color-accent-light);
}

.release-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.release-skeleton {
  aspect-ratio: 0.72;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background:
    linear-gradient(100deg, transparent 25%, rgba(255, 255, 255, 0.05) 45%, transparent 65%) 0 0 / 220% 100%,
    rgba(255, 255, 255, 0.035);
  animation: shimmer 1.8s infinite linear;
}

.listening-section {
  display: grid;
  grid-template-columns: minmax(230px, 0.72fr) minmax(0, 1.45fr);
  gap: clamp(48px, 8vw, 110px);
  margin-top: 120px;
  padding: 58px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 0 100%, rgba(184, 28, 42, 0.23), transparent 38%),
    rgba(255, 255, 255, 0.035);
}

.listening-copy .text-link {
  display: inline-block;
  margin-top: 28px;
}

.track-list {
  border-top: 1px solid var(--color-border);
}

.track-item {
  border-bottom: 1px solid var(--color-border);
}

.track-item.active {
  background: linear-gradient(90deg, rgba(255, 59, 59, 0.08), transparent);
}

.track-summary {
  display: grid;
  width: 100%;
  grid-template-columns: 36px minmax(0, 1fr) auto 34px;
  align-items: center;
  gap: 15px;
  padding: 19px 4px;
  border: 0;
  background: transparent;
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.track-summary:hover .track-main strong {
  color: var(--color-accent-light);
}

.track-index,
.duration {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.track-main {
  min-width: 0;
}

.track-main strong,
.track-main small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-main strong {
  font-size: 15px;
  transition: color 0.2s;
}

.track-main small {
  margin-top: 5px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.play-icon {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: var(--color-accent-light);
  font-size: 9px;
}

.state-card {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-soft);
  text-align: center;
}

.state-card p {
  margin: 0;
}

.state-card button,
.state-card a {
  margin-top: 16px;
  padding: 10px 17px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.compact-state {
  min-height: 190px;
  border-radius: var(--radius-md);
}

.listening-empty {
  min-height: 180px;
  border-radius: var(--radius-md);
}

.explore-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 48px;
  margin-top: 120px;
  padding: 64px;
  overflow: hidden;
  border: 1px solid rgba(255, 100, 100, 0.22);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(110deg, rgba(117, 12, 24, 0.82), rgba(31, 13, 18, 0.92) 55%, rgba(12, 11, 14, 0.96)),
    var(--color-surface-strong);
  box-shadow: var(--shadow-card);
}

.explore-section h2 {
  font-size: clamp(36px, 5vw, 68px);
  line-height: 1.08;
}

.explore-actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 12px;
  min-width: 190px;
}

.primary-link,
.secondary-link {
  padding: 13px 19px;
  border-radius: 999px;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 750;
}

.primary-link {
  background: #fff;
  color: #151116;
}

.secondary-link {
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
}

@media (max-width: 900px) {
  .hero-heading {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hero-copy {
    max-width: 580px;
  }

  .release-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .listening-section {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 42px;
  }

  .explore-section {
    align-items: flex-start;
    flex-direction: column;
    padding: 48px;
  }

  .explore-actions {
    width: min(100%, 360px);
  }
}

@media (max-width: 600px) {
  .home {
    padding-bottom: 48px;
  }

  .hero-section {
    padding-top: 34px;
  }

  .hero-heading,
  .editorial-section,
  .listening-section,
  .explore-section {
    width: min(100% - 32px, var(--content-width));
  }

  .hero-heading {
    padding-bottom: 28px;
  }

  .hero-heading h1 {
    font-size: clamp(40px, 13vw, 58px);
  }

  .hero-section :deep(.carousel),
  .hero-placeholder,
  .hero-state {
    width: calc(100% - 16px);
    border-radius: 18px;
  }

  .hero-placeholder {
    min-height: 500px;
  }

  .editorial-section {
    padding-top: 78px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .release-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .listening-section {
    margin-top: 78px;
    padding: 28px 18px;
    border-radius: 18px;
  }

  .track-summary {
    grid-template-columns: 28px minmax(0, 1fr) 30px;
    gap: 10px;
  }

  .duration {
    display: none;
  }


  .explore-section {
    margin-top: 78px;
    padding: 35px 25px;
    border-radius: 18px;
  }
}

@media (max-width: 390px) {
  .release-grid {
    grid-template-columns: 1fr;
  }
}
</style>
