<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Carousel from '../components/Carousel.vue'
import HomeReleaseCard from '../components/HomeReleaseCard.vue'
import { getFeaturedBands } from '../api/bands.js'
import { getAllAlbums } from '../api/albums.js'
import { useMusicPlayer } from '../composables/useMusicPlayer.js'

import heroCollage from '../assets/generated/rockweb-hero-collage.png'
import archivePortrait from '../assets/generated/rockweb-archive-portrait.png'
import methodBand from '../assets/generated/rockweb-method-band.png'
import methodRecord from '../assets/generated/rockweb-method-record.png'
import methodListen from '../assets/generated/rockweb-method-listen.png'
import methodDiscover from '../assets/generated/rockweb-method-discover.png'
import workLive from '../assets/generated/rockweb-work-live.png'
import workCover from '../assets/generated/rockweb-work-cover.png'

const router = useRouter()
const bands = ref([])
const albums = ref([])
const heroLoading = ref(true)
const releasesLoading = ref(true)
const heroError = ref('')
const releasesError = ref('')
const archiveFilter = ref('all')
const homeElement = ref(null)
const { currentTrackKey, isPlaying, getTrackKey, playTrack } = useMusicPlayer()
let revealObserver = null

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
        coverUrl: album.coverUrl,
      })
    }
    if (picks.length === 4) break
  }
  return picks
})

const archiveEntries = computed(() => {
  const entries = []

  bands.value.slice(0, 4).forEach((band) => {
    entries.push({
      id: `band-${band._id}`,
      kind: 'discover',
      label: '发现',
      title: band.name || '未命名乐队',
      description: band.bio || `${band.country || '现场'} · ${(band.genre || []).join(' / ') || '独立摇滚档案'}`,
      image: band.coverImage || archivePortrait,
      bandId: band._id,
    })
  })

  latestReleases.value.slice(0, 5).forEach((album) => {
    entries.push({
      id: `album-${album._id}`,
      kind: 'archive',
      label: '档案',
      title: album.title || '未命名专辑',
      description: `${album.band?.name || '未知乐队'}${album.releaseYear ? ` · ${album.releaseYear}` : ''}`,
      image: album.coverUrl || workCover,
      bandId: album.band?._id,
    })
  })

  playableTracks.value.forEach((track) => {
    entries.push({
      id: `track-${getTrackKey(track, trackContext(track))}`,
      kind: 'listen',
      label: '试听',
      title: track.title || '未命名曲目',
      description: `${track.bandName} · ${track.albumTitle}`,
      image: track.coverUrl || methodListen,
      track,
    })
  })

  return entries.slice(0, 12)
})

const filteredArchiveEntries = computed(() => {
  if (archiveFilter.value === 'all') return archiveEntries.value
  return archiveEntries.value.filter((entry) => entry.kind === archiveFilter.value)
})

const capabilities = [
  { number: '01', label: '乐队', title: '认识乐队', text: '从精选入口进入乐队故事、成员与风格脉络。', image: archivePortrait },
  { number: '02', label: '发行', title: '翻阅专辑', text: '按年份与封面重新发现已经入库的唱片。', image: methodRecord },
  { number: '03', label: '播放', title: '今夜试听', text: '在浏览档案的同时，保持一条可继续播放的声音线索。', image: methodListen },
  { number: '04', label: '档案', title: '持续入库', text: '让新的乐队与唱片慢慢加入这份私人收藏。', image: methodDiscover },
]

const methods = [
  { number: '01', title: '挑一支乐队', text: '从精选入口或乐队档案开始。', image: methodBand },
  { number: '02', title: '打开一张唱片', text: '看封面、年份和它所属的故事。', image: methodRecord },
  { number: '03', title: '放一首歌', text: '让播放器接管今晚的背景声。', image: methodListen },
  { number: '04', title: '继续发现', text: '回到档案，加入下一张唱片。', image: methodDiscover },
]

const works = [
  { title: '现场之前', text: '一份在夜里打开的音乐目录。', image: workLive },
  { title: '封面之后', text: '从唱片表面继续走进乐队。', image: workCover },
]

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

function goToEntry(entry) {
  if (entry.track) {
    selectTrack(entry.track)
    return
  }
  if (entry.bandId) router.push({ name: 'band-detail', params: { id: entry.bandId } })
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

function observeRevealTargets() {
  if (!revealObserver || !homeElement.value) return

  nextTick(() => {
    homeElement.value.querySelectorAll('[data-reveal]').forEach((element) => {
      if (element.dataset.revealObserved) return
      element.dataset.revealObserved = 'true'
      revealObserver.observe(element)
    })
  })
}

onMounted(() => {
  loadBands()
  loadAlbums()

  if (
    homeElement.value &&
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    homeElement.value.classList.add('has-reveal')
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    )
    observeRevealTargets()
  }
})

watch([archiveEntries, filteredArchiveEntries], observeRevealTargets, { flush: 'post' })

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  revealObserver = null
})
</script>

<template>
  <div ref="homeElement" class="home">
    <section class="hero-section" data-reveal aria-labelledby="hero-title">
      <div class="wrap">
        <div class="hero-grid">
          <div>
            <p class="eyebrow mono">Ⅰ / ROCK WEB · 第 01 期</p>
            <h1 id="hero-title">那些让夜晚保持清醒的声音<span class="dot"></span></h1>
            <p class="hero-lead">从华语独立摇滚出发，收藏乐队、唱片与可以反复回到的瞬间。</p>
            <div class="actions">
              <router-link class="action primary" :to="{ name: 'band-list' }">进入乐队档案 ↗</router-link>
              <router-link class="action secondary" :to="{ name: 'home', hash: '#listen' }">打开今夜试听</router-link>
            </div>
          </div>

          <div class="hero-art" :style="{ backgroundImage: `url(${heroCollage})` }">
            <div v-if="heroLoading" class="hero-state">正在整理精选档案...</div>
            <div v-else-if="heroError" class="hero-state error-state">
              <p>{{ heroError }}</p>
              <button type="button" @click="loadBands">重新连接</button>
            </div>
            <div v-else-if="!bands.length" class="hero-state">
              <p>舞台还没有设置精选乐队。</p>
              <router-link :to="{ name: 'band-list' }">浏览全部乐队</router-link>
            </div>
            <Carousel v-else :bands="bands" @select="goToBand" />
            <span class="art-label mono">精选乐队 / 01—03</span>
          </div>
        </div>

        <div class="hero-foot rule">
          <p>一份持续生长的个人摇滚档案。真实乐队、代表专辑，以及可以合法播放的第三方声音入口。</p>
          <div class="stat-rings">
            <span class="ring">乐队<br />档案</span>
            <span class="ring">唱片<br />收藏</span>
            <span class="ring">合法<br />试听</span>
          </div>
        </div>
      </div>
    </section>

    <section class="about-section" id="about" data-reveal aria-labelledby="about-title">
      <div class="wrap about-grid">
        <div class="about-art"><img :src="archivePortrait" alt="摇滚现场与唱片的档案拼贴" /></div>
        <div class="about-copy">
          <p class="eyebrow mono">Ⅱ / 关于</p>
          <h2 id="about-title">不只是<span class="serif">播放列表</span><span class="dot"></span></h2>
          <p>Rock Web 把喜欢的乐队、代表专辑和可反复回到的声音放在同一张桌面上。</p>
          <small>这里没有算法替你决定今晚听什么，只有一份持续生长的个人档案。向下翻，先从精选乐队开始。</small>
        </div>
      </div>
    </section>

    <section class="capabilities" data-reveal aria-labelledby="capabilities-title">
      <div class="wrap">
        <div class="section-head">
          <p class="section-index mono">Ⅲ / 能力</p>
          <h2 id="capabilities-title">把一张唱片的前后都留下<span class="dot"></span></h2>
        </div>
        <div class="cap-grid">
          <article
            v-for="(cap, index) in capabilities"
            :key="cap.number"
            class="cap"
            data-reveal
            :style="{ '--reveal-delay': `${index * 80}ms` }"
          >
            <img :src="cap.image" :alt="cap.title" loading="lazy" />
            <p class="mono">{{ cap.number }} / {{ cap.label }}</p>
            <h3>{{ cap.title }}</h3>
            <p>{{ cap.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="albums" class="archive-section" data-reveal aria-labelledby="archive-title">
      <div class="wrap">
        <div class="section-head">
          <p class="section-index mono">Ⅳ / 档案</p>
          <h2 id="archive-title">继续翻找，直到碰到下一张<span class="serif">想听的唱片</span><span class="dot"></span></h2>
        </div>
        <div class="labs-intro">
          <p class="mono">ROCK WEB 的首页保留四条原始路径：精选乐队、最新发行、今夜试听、继续探索。</p>
          <p>下面的内容直接来自当前乐队、专辑与曲目数据。它们会沿用现有信息源，但以更像杂志目录的方式重新排列。</p>
        </div>
        <div class="filter-bar" role="toolbar" aria-label="筛选档案">
          <button
            v-for="filter in [{ key: 'all', label: '全部' }, { key: 'archive', label: '档案' }, { key: 'listen', label: '试听' }, { key: 'discover', label: '发现' }]"
            :key="filter.key"
            class="filter"
            type="button"
            :aria-pressed="archiveFilter === filter.key"
            @click="archiveFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>
        <div v-if="filteredArchiveEntries.length" class="lab-grid">
          <article
            v-for="entry in filteredArchiveEntries"
            :key="entry.id"
            class="lab"
            data-reveal
            :class="{ interactive: entry.track || entry.bandId }"
          >
            <button v-if="entry.track || entry.bandId" class="lab-action" type="button" :aria-label="`打开 ${entry.title}`" @click="goToEntry(entry)"></button>
            <img :src="entry.image" :alt="entry.title" loading="lazy" />
            <div class="lab-body">
              <p class="mono">{{ entry.label }}</p>
              <h3>{{ entry.title }}</h3>
              <p>{{ entry.description }}</p>
            </div>
          </article>
        </div>
        <p v-else class="lab-empty" role="status">当前筛选暂无条目。</p>
      </div>
    </section>

    <section class="method" data-reveal aria-labelledby="method-title">
      <div class="wrap">
        <div class="section-head">
          <p class="section-index mono">Ⅴ / 方法</p>
          <h2 id="method-title">四步，重新找到今晚的声音<span class="dot"></span></h2>
        </div>
        <div class="method-grid">
          <article
            v-for="(item, index) in methods"
            :key="item.number"
            class="step"
            data-reveal
            :style="{ '--reveal-delay': `${index * 80}ms` }"
          >
            <img :src="item.image" :alt="item.title" loading="lazy" />
            <p class="mono">{{ item.number }}</p>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="work" data-reveal aria-labelledby="work-title">
      <div class="wrap">
        <div class="section-head">
          <p class="section-index mono">Ⅵ / 精选作品</p>
          <h2 id="work-title">从封面表面，继续走进去<span class="dot"></span></h2>
        </div>
        <div class="work-grid">
          <article
            v-for="(work, index) in works"
            :key="work.title"
            class="work-card"
            data-reveal
            :style="{ '--reveal-delay': `${index * 120}ms` }"
            :class="{ offset: index === 1 }"
          >
            <img :src="work.image" :alt="work.title" loading="lazy" />
            <h3>{{ work.title }}</h3>
            <p>{{ work.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="listen" class="listen" data-reveal aria-labelledby="listen-title">
      <div class="wrap listen-layout">
        <div class="listen-copy">
          <p class="eyebrow mono">Ⅶ / 今夜试听</p>
          <h2 id="listen-title">今夜试听<span class="dot"></span></h2>
          <p>挑一首歌放进全局播放器，边听边继续浏览。官方嵌入和授权音频都会沿用现有播放逻辑。</p>
          <router-link class="action secondary" :to="{ name: 'album-list' }">探索唱片收藏 ↗</router-link>
        </div>
        <div v-if="playableTracks.length" class="track-list" aria-label="今夜试听曲目">
          <article v-for="(track, index) in playableTracks" :key="trackKey(track)" class="track" :class="{ 'is-playing': isActiveTrack(track) }">
            <span class="track-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="track-title">
              <strong>{{ track.title || '未命名曲目' }}</strong>
              <small>{{ track.bandName }} · {{ track.albumTitle }}</small>
            </div>
            <span class="track-meta">{{ track.duration || '—' }}</span>
            <button class="track-button" type="button" :aria-label="`播放 ${track.title || '未命名曲目'}`" @click="selectTrack(track)">
              {{ isActiveTrack(track) && track.audioUrl && isPlaying ? '❚❚' : '▶' }}
            </button>
          </article>
        </div>
        <div v-else class="listen-empty">
          <p>当前还没有可试听曲目，可以先去乐队档案看看。</p>
        </div>
      </div>
    </section>

    <section class="quote" data-reveal aria-label="Rock Web 引言">
      <div class="wrap">
        <blockquote>“让一张唱片不只停留在播放按钮之前。”<span class="dot"></span></blockquote>
        <div class="partners" aria-label="Rock Web 标记">
          <span class="partner">R</span><span class="partner">W</span><span class="partner">Ø</span><span class="partner">A</span><span class="partner">V</span>
        </div>
      </div>
    </section>

    <section class="cta" data-reveal aria-labelledby="cta-title">
      <div class="wrap cta-inner">
        <div>
          <p class="mono">Ⅷ / 继续探索</p>
          <h2 id="cta-title">今晚，先听一首<span class="dot"></span></h2>
        </div>
        <div>
          <p>从最新发行开始，继续翻阅 ROCK WEB 的声音档案。</p>
          <div class="cta-actions">
            <router-link class="action primary" :to="{ name: 'album-list' }">浏览唱片收藏 ↗</router-link>
            <router-link class="action secondary" :to="{ name: 'band-list' }">进入乐队档案</router-link>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <p class="mono">ROCK WEB</p>
            <p class="footer-copy">LOUD · RAW · LIVE<br />一份持续生长的个人音乐档案。</p>
          </div>
          <div>
            <p class="mono">浏览</p>
            <router-link :to="{ name: 'band-list' }">乐队档案</router-link>
            <router-link :to="{ name: 'album-list' }">唱片收藏</router-link>
          </div>
          <div>
            <p class="mono">聆听</p>
            <router-link :to="{ name: 'home', hash: '#listen' }">今夜试听</router-link>
            <router-link :to="{ name: 'home' }">回到首页</router-link>
          </div>
          <div>
            <p class="mono">信息</p>
            <router-link :to="{ name: 'home', hash: '#about' }">关于档案</router-link>
            <span class="footer-version">版本 01 / 2026</span>
          </div>
        </div>
        <div class="footer-mega">保持清醒<span class="dot"></span></div>
        <div class="footer-bottom mono"><span>ROCK WEB / 在线档案</span><span>内容与信息架构沿用现有站点</span></div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home {
  background: var(--paper);
}

.home.has-reveal [data-reveal] {
  opacity: 0;
  transform: translateY(34px) rotate(0.35deg);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

.home.has-reveal [data-reveal].is-visible {
  opacity: 1;
  transform: none;
}

.home.has-reveal .hero-section {
  transition-duration: 1s;
}

.home.has-reveal .hero-section .hero-art {
  transform: translateY(22px) rotate(1deg) scale(0.985);
  transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.home.has-reveal .hero-section.is-visible .hero-art {
  transform: none;
}

.hero-section {
  padding: 70px 0 88px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
  align-items: end;
  gap: clamp(34px, 7vw, 110px);
}

.eyebrow,
.section-index {
  margin: 0 0 20px;
  color: var(--coral-text);
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1,
h2 {
  font-weight: 500;
  letter-spacing: -0.03em;
}

h1,
.section-head h2,
.cta h2 {
  font-family: var(--sans);
}

h1 {
  max-width: 680px;
  margin-bottom: 24px;
  font-size: clamp(52px, 8vw, 116px);
  line-height: 0.92;
  text-wrap: balance;
}

.hero-lead {
  max-width: 380px;
  margin: 0 0 30px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.6;
}

.actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 45px;
  padding: 0 17px;
  border: 1px solid var(--ink);
  text-decoration: none;
  font-size: 13px;
  transition: transform 0.2s, background 0.2s, color 0.2s;
}

.action:hover {
  transform: translateY(-2px);
}

.action.primary {
  background: var(--ink);
  color: var(--paper);
}

.action.primary:hover {
  border-color: var(--coral);
  background: var(--coral);
  color: var(--ink);
}

.action.secondary:hover {
  background: var(--paper-2);
}

.hero-art {
  position: relative;
  min-height: 470px;
  overflow: hidden;
  border: 1px solid var(--ink);
  background-position: center;
  background-size: cover;
  box-shadow: 10px 10px 0 var(--ink);
}

.hero-art::before {
  position: absolute;
  inset: 0;
  background: rgba(243, 238, 229, 0.42);
  content: '';
}

.hero-art :deep(.carousel) {
  position: absolute;
  inset: 24px;
  z-index: 1;
  width: auto;
  height: auto;
  min-height: 0;
  border: 1px solid var(--ink);
  box-shadow: 5px 5px 0 var(--coral);
}

.hero-state {
  position: absolute;
  inset: 24px;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: 25px;
  border: 1px solid var(--ink);
  background: rgba(243, 238, 229, 0.9);
  color: var(--muted);
  text-align: center;
}

.hero-state p {
  margin: 0;
}

.hero-state button,
.hero-state a {
  margin-top: 14px;
  padding: 9px 14px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--paper);
  text-decoration: none;
}

.error-state {
  color: var(--coral-text);
}

.art-label {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 3;
  padding: 8px 10px;
  background: var(--coral);
  color: var(--ink);
}

.hero-foot {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 26px;
  margin-top: 46px;
  padding-top: 18px;
  border-top: 1px dotted var(--line);
}

.hero-foot p {
  max-width: 470px;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.stat-rings {
  display: flex;
  gap: 14px;
}

.ring {
  display: grid;
  width: 66px;
  height: 66px;
  place-items: center;
  border: 1px dotted var(--ink);
  border-radius: 50%;
  text-align: center;
  font-size: 10px;
  line-height: 1.1;
}

section {
  padding: 104px 0;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 42px;
}

.section-head h2 {
  max-width: 720px;
  margin-bottom: 0;
  font-size: clamp(42px, 6vw, 84px);
  line-height: 0.94;
}

.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  align-items: center;
  gap: clamp(42px, 9vw, 130px);
}

.about-art {
  position: relative;
  min-height: 410px;
}

.about-art img {
  width: 82%;
  margin-left: 8%;
  border: 1px solid var(--ink);
  transform: rotate(-4deg);
}

.about-art::after {
  position: absolute;
  right: 0;
  bottom: 22px;
  padding: 12px 16px;
  background: var(--ink);
  color: var(--paper);
  content: '私人档案';
  font: 12px var(--serif);
  font-style: italic;
  transform: rotate(6deg);
}

.about-copy {
  max-width: 580px;
}

.about-copy h2 {
  margin: 0 0 27px;
  font-family: var(--sans);
  font-size: clamp(48px, 7vw, 98px);
  line-height: 0.9;
}

.about-copy > p:not(.eyebrow) {
  margin-bottom: 27px;
  font-size: clamp(23px, 3vw, 38px);
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.about-copy small {
  display: block;
  max-width: 390px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

.capabilities,
.method {
  background: var(--paper-2);
}

.cap-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
}

.cap {
  min-height: 390px;
  padding: 24px 20px 26px;
  border-right: 1px solid var(--ink);
}

.cap:first-child {
  border-left: 1px solid var(--ink);
}

.cap img {
  width: 100%;
  height: 178px;
  margin-bottom: 24px;
  border: 1px solid var(--ink);
  object-fit: cover;
}

.cap h3 {
  margin: 18px 0 11px;
  font-size: 25px;
  letter-spacing: -0.03em;
}

.cap p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.cap p.mono,
.step p.mono,
.lab-body p.mono {
  color: var(--coral-text);
}

.labs-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: 42px;
  margin-bottom: 34px;
}

.labs-intro p {
  max-width: 480px;
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 29px;
}

.filter {
  min-height: 44px;
  padding: 8px 11px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-size: 12px;
}

.filter[aria-pressed='true'],
.filter:hover {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
}

.lab-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.lab {
  position: relative;
  min-width: 0;
  border-top: 1px solid var(--ink);
}

.lab.interactive:hover h3 {
  color: var(--coral-text);
}

.lab-action {
  position: absolute;
  inset: 0;
  z-index: 2;
  border: 0;
  background: transparent;
}

.lab img {
  width: 100%;
  aspect-ratio: 1.14;
  border-right: 1px solid var(--ink);
  border-left: 1px solid var(--ink);
  object-fit: cover;
}

.lab-body {
  padding: 15px 10px 18px;
}

.lab-body h3 {
  margin: 10px 0 8px;
  font-size: 18px;
  transition: color 0.2s;
}

.lab-body p {
  min-height: 66px;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.lab-empty {
  margin: 20px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.step {
  padding-top: 16px;
  border-top: 1px solid var(--ink);
}

.step img {
  width: 100%;
  aspect-ratio: 1.28;
  margin-bottom: 18px;
  border: 1px solid var(--ink);
  object-fit: cover;
}

.step h3 {
  margin: 11px 0 8px;
  font-size: 21px;
}

.step > p:last-child {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.work {
  background: var(--ink);
  color: var(--paper);
}

.work .section-index,
.work .eyebrow {
  color: var(--coral);
}

.work .dot {
  background: var(--coral);
}

.work-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: start;
  gap: 30px;
}

.work-card.offset {
  margin-top: 110px;
}

.work-card img {
  width: 100%;
  border: 1px solid var(--paper);
}

.work-card:first-child img {
  transform: rotate(-2.5deg);
}

.work-card:nth-child(2) img {
  transform: rotate(4deg);
}

.work-card h3 {
  margin: 22px 0 8px;
  font: 500 32px/1 var(--serif);
  font-style: italic;
}

.work-card p {
  max-width: 300px;
  margin: 0;
  color: rgba(243, 238, 229, 0.68);
  font-size: 14px;
  line-height: 1.6;
}

.listen {
  padding-bottom: 120px;
}

.listen-layout {
  display: grid;
  grid-template-columns: minmax(230px, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(42px, 9vw, 140px);
}

.listen-copy h2 {
  margin: 0 0 20px;
  font-family: var(--sans);
  font-size: clamp(48px, 7vw, 98px);
  line-height: 0.9;
}

.listen-copy > p:not(.eyebrow) {
  max-width: 300px;
  margin-bottom: 28px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

.track-list {
  border-top: 1px solid var(--ink);
}

.track {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto 44px;
  align-items: center;
  gap: 14px;
  padding: 17px 0;
  border-bottom: 1px dotted var(--line);
}

.track-number,
.track-meta {
  color: var(--muted);
  font: 11px ui-monospace, monospace;
}

.track-title {
  min-width: 0;
}

.track-title strong,
.track-title small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-title strong {
  font-size: 16px;
}

.track-title small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.track-button {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--ink);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  font-size: 11px;
}

.track-button:hover,
.track.is-playing .track-button {
  border-color: var(--coral);
  background: var(--coral);
}

.track.is-playing .track-title strong {
  color: var(--coral-text);
}

.listen-empty {
  padding: 24px;
  border: 1px solid var(--line);
  color: var(--muted);
}

.listen-empty p {
  margin: 0;
}

.quote {
  padding: 88px 0 92px;
  border-top: 1px dotted var(--line);
  border-bottom: 1px dotted var(--line);
}

blockquote {
  max-width: 850px;
  margin: 0 auto 34px;
  text-align: center;
  font: 500 clamp(35px, 6vw, 76px)/1.02 var(--serif);
  font-style: italic;
  letter-spacing: -0.04em;
}

.partners {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: var(--muted);
}

.partner {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  font: 600 13px var(--serif);
}

.cta {
  position: relative;
  overflow: hidden;
  padding: 92px 0 112px;
  background: var(--coral);
}

.cta::after {
  position: absolute;
  right: -30px;
  bottom: -70px;
  color: rgba(29, 27, 26, 0.1);
  content: 'ROCK';
  font: 700 240px/0.8 var(--sans);
  letter-spacing: -0.12em;
}

.cta .dot {
  background: var(--ink);
}

.cta-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 28px;
}

.cta h2 {
  max-width: 650px;
  margin: 0;
  font-size: clamp(48px, 7vw, 98px);
  line-height: 0.9;
}

.cta-inner > div:last-child > p {
  max-width: 350px;
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.55;
}

.site-footer {
  padding: 52px 0 34px;
  background: var(--ink);
  color: var(--paper);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 30px;
  padding-bottom: 60px;
}

.footer-copy {
  max-width: 220px;
  color: rgba(243, 238, 229, 0.65);
  font-size: 14px;
  line-height: 1.6;
}

.footer-grid a,
.footer-version {
  display: block;
  margin-top: 11px;
  color: rgba(243, 238, 229, 0.68);
  text-decoration: none;
  font-size: 13px;
}

.footer-grid a:hover {
  color: var(--coral);
}

.footer-mega {
  padding-top: 34px;
  border-top: 1px dotted rgba(243, 238, 229, 0.36);
  font: 500 clamp(54px, 13vw, 178px)/0.8 var(--serif);
  font-style: italic;
  letter-spacing: -0.08em;
}

.footer-mega .dot {
  background: var(--coral);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 28px;
  color: rgba(243, 238, 229, 0.5);
}

@media (max-width: 980px) {
  .hero-grid,
  .about-grid,
  .labs-intro,
  .listen-layout {
    grid-template-columns: 1fr;
  }

  .hero-art {
    width: min(100%, 680px);
    min-height: 500px;
    margin-inline: auto;
  }

  .cap-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cap:nth-child(2) {
    border-right: 0;
  }

  .cap:nth-child(3),
  .cap:nth-child(4) {
    border-top: 1px solid var(--ink);
  }

  .lab-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .method-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .work-grid {
    grid-template-columns: 1fr;
  }

  .work-card.offset {
    width: min(82%, 520px);
    margin: 48px 0 0 auto;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding-top: 46px;
  }

  h1 {
    font-size: clamp(50px, 15vw, 80px);
  }

  .hero-grid {
    gap: 44px;
  }

  .hero-art {
    min-height: 390px;
  }

  .hero-art :deep(.carousel),
  .hero-state {
    inset: 14px;
  }

  .hero-foot,
  .cta-inner {
    grid-template-columns: 1fr;
  }

  .stat-rings {
    justify-content: flex-start;
  }

  section {
    padding: 76px 0;
  }

  .section-head {
    align-items: start;
    flex-direction: column;
    margin-bottom: 31px;
  }

  .section-head h2 {
    font-size: clamp(44px, 14vw, 70px);
  }

  .about-art {
    min-height: 320px;
  }

  .cap-grid {
    grid-template-columns: 1fr;
  }

  .cap,
  .cap:nth-child(2) {
    min-height: 0;
    border-top: 1px solid var(--ink);
    border-right: 0;
    border-left: 0;
  }

  .cap:first-child {
    border-top: 0;
  }

  .cap img {
    height: 210px;
  }

  .lab-grid,
  .method-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .lab-body p {
    min-height: 84px;
  }

  .work-card.offset {
    width: 88%;
  }

  .track {
    grid-template-columns: 27px minmax(0, 1fr) 44px;
  }

  .track-meta {
    display: none;
  }

  .cta-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-grid > div:first-child {
    grid-column: 1 / -1;
  }

  .footer-mega {
    font-size: 23vw;
  }

  .footer-bottom {
    flex-direction: column;
  }
}

@media (max-width: 390px) {
  .lab-grid,
  .method-grid {
    grid-template-columns: 1fr;
  }
}
</style>
