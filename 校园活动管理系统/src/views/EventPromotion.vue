<template>
  <div class="page">
    <NavBar />

    <!-- Hero -->
    <div v-if="heroEvent" class="activity-container">
      <div class="image-section">
        <img :src="heroEvent.image" :alt="heroEvent.title" />
      </div>
      <div class="content-section">
        <h2>{{ heroEvent.title }}</h2>
        <div v-if="heroEvent.description" v-html="formatDescription(heroEvent.description)"></div>
        <p v-else>暂无描述</p>
        <a @click.prevent="gotoEvent(heroEvent.id)" href="#" class="btn">查看详情 <span class="arrow">→</span></a>
      </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import gradImg from '@/assets/graduation.png'
import { fetchEvents, fetchEventDetail } from '@/api/event'

const router = useRouter()

// 后端基础地址，用于拼接封面图片等静态资源完整 URL
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const heroEvent = ref(null)
const loadingHero = ref(false)
const events = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 构建图片URL
const buildImageUrl = (coverUrl) => {
  if (!coverUrl) return gradImg
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

// 加载 Hero 活动（第一个活动）
const loadHeroEvent = async () => {
  loadingHero.value = true
  try {
    const data = await fetchEvents({ page: 1, pageSize: 1 })
    const eventList = data?.list || []
    
    if (eventList.length > 0) {
      const firstEvent = eventList[0]
      // 获取活动详情以获取完整描述
      try {
        const detail = await fetchEventDetail(firstEvent.id)
        heroEvent.value = {
          id: detail.id,
          title: detail.title || '活动标题',
          description: detail.description || '',
          image: buildImageUrl(detail.cover_url),
          location: detail.location || '',
          start_time: detail.start_time,
          end_time: detail.end_time
        }
      } catch (err) {
        // 如果获取详情失败，使用列表数据
        heroEvent.value = {
          id: firstEvent.id,
          title: firstEvent.title || '活动标题',
          description: firstEvent.description || '',
          image: buildImageUrl(firstEvent.cover_url),
          location: firstEvent.location || '',
          start_time: firstEvent.start_time,
          end_time: firstEvent.end_time
        }
      }
    }
  } catch (err) {
    console.error('加载 Hero 活动失败:', err)
  } finally {
    loadingHero.value = false
  }
}

// 加载活动列表（只获取前8个，排除第一个）
const loadEvents = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchEvents({ page: 1, pageSize: 9 })
    const eventList = data?.list || []
    
    // 跳过第一个活动（已在 Hero 显示），只取接下来的8个活动
    const eventsToShow = eventList.slice(1, 9)
    
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
  loadHeroEvent()
  loadEvents()
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
  margin: 40px auto 0;
  background-color: #0053a9; /* 整个区域为蓝色背景 */
  border-radius: 8px;
  overflow: visible; /* 允许图片凸出 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  align-items: center;
  padding: 36px; /* 左侧留出蓝色边距 */
  column-gap: 32px;
  position: relative;
}

.image-section {
  flex: 0 0 420px; /* 固定图片区宽度 */
  position: relative;
  z-index: 2;
  align-self: center; /* 垂直居中 */
}
.image-section img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
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
  .activity-container { padding: 20px; column-gap: 16px; }
  .image-section { flex-basis: 320px; align-self: center; }
  .content-section h2 { font-size: 2rem; }
}

@media (max-width: 600px) {
  .activity-container { flex-direction: column; padding: 18px; }
  .image-section { align-self: center; width: 100%; flex-basis: auto; }
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


</style>