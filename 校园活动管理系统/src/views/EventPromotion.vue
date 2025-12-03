<template>
  <div class="page">
    <NavBar />

    <!-- Hero 轮播，展示前 3 个活动 -->
    <div
      v-if="heroEvents.length"
      class="activity-container"
      @mouseenter="stopHeroCarousel"
      @mouseleave="startHeroCarousel"
    >
      <!-- 左箭头 -->
      <button class="carousel-arrow left" @click="prevHero">
        ‹
      </button>

      <!-- 当前活动内容 -->
      <div class="image-section">
        <img :src="currentHero.image" :alt="currentHero.title" />
      </div>
      <div class="content-section">
        <h2>{{ currentHero.title }}</h2>
        <div
          v-if="currentHero.description"
          v-html="formatDescription(currentHero.description)"
        ></div>
        <p v-else>暂无描述</p>
        <a
          @click.prevent="gotoEvent(currentHero.id)"
          href="#"
          class="btn"
        >
          查看详情 <span class="arrow">→</span>
        </a>

        <!-- 小圆点指示器 -->
        <div class="carousel-dots">
          <span
            v-for="(item, index) in heroEvents"
            :key="item.id"
            class="dot"
            :class="{ active: index === currentHeroIndex }"
            @click="goHero(index)"
          ></span>
        </div>
      </div>

      <!-- 右箭头 -->
      <button class="carousel-arrow right" @click="nextHero">
        ›
      </button>
    </div>
    <div v-else-if="loadingHero" class="activity-container">
      <div class="content-section" style="width: 100%; text-align: center;">
        <p>加载中...</p>
      </div>
    </div>

    <!-- 下方活动列表 -->
    <section class="events-list">
      <h3>更多活动</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-else class="events-grid">
        <article class="event-card" v-for="ev in events" :key="ev.id">
          <div class="card-thumb">
            <img :src="ev.image" :alt="ev.title" />
          </div>
          <div class="card-body">
            <h4>{{ ev.title }}</h4>
            <p class="meta">{{ ev.date }} · {{ ev.location }}</p>
            <p class="excerpt">{{ ev.excerpt }}</p>
            <div class="card-actions">
              <button class="btn blue" @click="gotoEvent(ev.id)">查看详情 →</button>
            </div>
          </div>
        </article>
      </div>
      <div v-if="!loading && !errorMsg && events.length === 0" class="empty-state">
        <p>暂无活动</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { fetchEvents, fetchEventDetail } from '@/api/event'

const router = useRouter()

// 后端基础地址，用于拼接封面图片等静态资源完整 URL
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const DEFAULT_COVER = `${API_ORIGIN}/uploads/3b72bdb5a6ca17d85131e816c9fdd0b1.jpg`

// 轮播 Hero 区：前 3 个活动
const heroEvents = ref([])
const currentHeroIndex = ref(0)
const loadingHero = ref(false)
const events = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 构建图片URL
const buildImageUrl = (coverUrl) => {
  if (!coverUrl) return DEFAULT_COVER
  // 如果已经是完整URL，直接返回
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
    return coverUrl
  }
  let normalized = coverUrl.replace(/\\/g, '/')
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  // 如果是相对路径，拼接API基础地址
  return API_ORIGIN + normalized
}

// 当前展示的 Hero 活动
const currentHero = computed(() => {
  return heroEvents.value[currentHeroIndex.value] || {}
})

// 轮播定时器
let heroTimer = null

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// 格式化描述文本，将换行符转换为段落
const formatDescription = (description) => {
  if (!description) return ''
  // 将换行符转换为 <br> 或段落
  return description
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line.trim()}</p>`)
    .join('')
}

// 加载 Hero 活动（前 3 个活动）
const loadHeroEvents = async () => {
  loadingHero.value = true
  try {
    const data = await fetchEvents({ page: 1, pageSize: 3 })
    const eventList = data?.list || []

    heroEvents.value = eventList.map((item) => ({
      id: item.id,
      title: item.title || '活动标题',
      description: item.description || '',
      image: buildImageUrl(item.cover_url),
      location: item.location || '',
      start_time: item.start_time,
      end_time: item.end_time
    }))

    if (heroEvents.value.length > 1) {
      startHeroCarousel()
    }
  } catch (err) {
    console.error('加载 Hero 活动失败:', err)
  } finally {
    loadingHero.value = false
  }
}

// 轮播控制
const startHeroCarousel = () => {
  if (heroEvents.value.length <= 1) return
  if (heroTimer) return
  heroTimer = setInterval(() => {
    nextHero()
  }, 3000)
}

const stopHeroCarousel = () => {
  if (heroTimer) {
    clearInterval(heroTimer)
    heroTimer = null
  }
}

const nextHero = () => {
  if (!heroEvents.value.length) return
  currentHeroIndex.value = (currentHeroIndex.value + 1) % heroEvents.value.length
}

const prevHero = () => {
  if (!heroEvents.value.length) return
  currentHeroIndex.value =
    (currentHeroIndex.value - 1 + heroEvents.value.length) % heroEvents.value.length
}

const goHero = (index) => {
  if (index < 0 || index >= heroEvents.value.length) return
  currentHeroIndex.value = index
}

// 加载活动列表（展示前 8 个，包括轮播中的活动）
const loadEvents = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchEvents({ page: 1, pageSize: 8 })
    const eventList = data?.list || []
    
    const eventsToShow = eventList
    
    events.value = eventsToShow.map((item) => ({
      id: item.id,
      title: item.title,
      date: formatDate(item.start_time),
      location: item.location || '',
      image: buildImageUrl(item.cover_url),
      excerpt: item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : '暂无描述'
    }))
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || '加载活动失败'
  } finally {
    loading.value = false
  }
}

function gotoEvent(id) {
  router.push({ name: 'EventInfo', params: { id } }).catch(() => {
    router.push('/promotion')
  })
}

onMounted(() => {
  loadHeroEvents()
  loadEvents()
})

onUnmounted(() => {
  stopHeroCarousel()
})
</script> 

<style scoped>
.page {
  background-color: #e6e6e6;
  min-height: 100vh;
}


.activity-container {
  display: flex;
  max-width: 1200px;
  margin: 35px auto 0;
  background-color: #0053a9; /* 整个区域为蓝色背景 */
  border-radius: 8px;
  overflow: visible; /* 允许图片凸出 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  align-items: center;
  padding: 36px; /* 左侧留出蓝色边距 */
  column-gap: 32px;
  position: relative;
  height: 560px; /* 固定高度，保持各轮播一致 */
}

.image-section {
  flex: 0 0 420px; /* 固定图片区宽度 */
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
}
.image-section img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  object-fit: cover;
}

.content-section {
  flex: 1;
  color: #fff;
  padding: 24px 30px;
}

.content-section h2 {
  font-size: 2.6rem;
  margin-bottom: 12px;
  position: relative;
  padding-bottom: 10px;
}
.content-section h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 56px;
  height: 4px;
  background-color: white;
}

.content-section p {
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 18px;
  text-align: justify;
}

.btn {
  padding: 12px 26px;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 50px;
  font-size: 1.05rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}
.btn:hover { background-color: rgba(255,255,255,0.08); }

/* 蓝色实心按钮，主要用于白底卡片上的可见 CTA */
.btn.blue{
  background-color: #0070d1;
  color: #fff;
  border: 1px solid #0062b0;
  padding: 8px 14px; /* 缩小按钮内边距 */
  font-size: 0.95rem; /* 略小文字 */
  border-radius: 6px;
}
.btn.blue:hover { background-color: #005aa0 }

/* 响应式 */
@media (max-width: 900px) {
  .activity-container { padding: 20px; column-gap: 16px; height: auto; }
  .image-section { flex-basis: 320px; align-self: center; height: auto; }
  .image-section img { height: auto; }
  .content-section h2 { font-size: 2rem; }
}

@media (max-width: 600px) {
  .activity-container { flex-direction: column; padding: 18px; height: auto; }
  .image-section { align-self: center; width: 100%; flex-basis: auto; height: auto; }
  .content-section { padding: 18px 8px; }
}

.events-list{max-width:1200px;margin:28px auto;padding:0 18px}
.events-list h3{max-width:1200px;margin:0 0 14px 18px;font-size:1.4rem;color:#123}
.loading,.error,.empty-state{text-align:center;padding:40px 20px;color:#666;font-size:16px}
.events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.event-card{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);display:flex;flex-direction:column}
.card-thumb img{width:100%;height:160px;object-fit:cover;display:block}
.card-body{padding:12px 14px;flex:1;display:flex;flex-direction:column}
.card-body h4{margin:0 0 6px;font-size:1.05rem}
.card-body .meta{color:#666;font-size:0.9rem;margin-bottom:8px}
.card-body .excerpt{flex:1;color:#444;font-size:0.95rem}
.card-actions{margin-top:12px;display:flex;justify-content:flex-end}
/* 轮播箭头 */
.carousel-arrow{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  width:40px;
  height:40px;
  border-radius:50%;
  border:none;
  background:rgba(255,255,255,0.2);
  color:#fff;
  font-size:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:background .2s, transform .2s;
  z-index:3;
}
.carousel-arrow.left{left:16px;}
.carousel-arrow.right{right:16px;}
.carousel-arrow:hover{
  background:rgba(255,255,255,0.35);
  transform:translateY(-50%) scale(1.05);
}

/* 轮播小圆点 */
.carousel-dots{
  position:absolute;
  left:50%;
  bottom:20px;
  transform:translateX(-50%);
  display:flex;
  gap:8px;
  align-items:center;
}
.dot{
  width:10px;
  height:10px;
  border-radius:50%;
  background:rgba(255,255,255,0.4);
  cursor:pointer;
  transition:background .2s, transform .2s;
}
.dot.active{
  background:#fff;
  transform:scale(1.2);
}

</style>