<template>
  <div class="page event-info">
    <NavBar />

    <div class="container">
      <button class="back" @click="goBack">← 返回</button>

      <section class="hero">
        <div class="hero-left">
          <img :src="event.image" alt="封面" />
        </div>

        <aside class="hero-right">
          <div class="date-card">
            <div class="day">{{ day }}</div>
            <div class="month-year">{{ month }}<br/>{{ year }}</div>
          </div>

          <div class="info-card">
            <h1 class="title">{{ event.title }}</h1>
            <p class="meta">{{ formattedDate }} · {{ event.location }}</p>
            <p class="excerpt">{{ event.excerpt }}</p>

            <div class="stats">
              <span>已报名：{{ event.signed_up || 0 }}</span>
              <span v-if="event.capacity"> / {{ event.capacity }} 人</span>
            </div>

            <div class="actions">
              <button class="btn primary" :disabled="isFull" @click="handleRegister">{{ isFull ? '已满员' : '我要报名' }}</button>
            </div>
          </div>

          <div class="small-card">
            <p>主办：{{ event.organizer || '学校' }}</p>
          </div>
        </aside>
      </section>

      <article class="description" v-html="event.description_html || '<p>暂无详细信息</p>'"></article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { fetchEventDetail, registerEvent } from '@/api/event'

const router = useRouter()
const route = useRoute()
const id = route.params.id

// 后端基础地址，用于拼接封面图片等静态资源完整 URL
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const DEFAULT_COVER = `${API_ORIGIN}/uploads/3b72bdb5a6ca17d85131e816c9fdd0b1.jpg`

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

const event = ref({})
const loading = ref(false)
const errorMsg = ref('')

const formattedDate = computed(() => {
  if (!event.value.start_time) return ''
  return new Date(event.value.start_time).toLocaleString()
})

const day = computed(() =>
  event.value.start_time ? new Date(event.value.start_time).getDate() : ''
)
const month = computed(() =>
  event.value.start_time ? (new Date(event.value.start_time).getMonth() + 1) + '月' : ''
)
const year = computed(() =>
  event.value.start_time ? new Date(event.value.start_time).getFullYear() : ''
)

const isFull = computed(
  () => event.value.capacity && event.value.signed_up >= event.value.capacity
)

function goBack() {
  router.back()
}

const requireLogin = () => {
  if (!localStorage.getItem('token')) {
    if (confirm('此操作需要登录，是否前往登录？')) {
      router.push('/login')
    }
    return false
  }
  return true
}

const loadEventDetail = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchEventDetail(id)
    event.value = {
      id: data.id,
      title: data.title,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      image: buildImageUrl(data.cover_url),
      organizer: data.organizer_name || '学校',
      capacity: data.capacity || 0,
      signed_up: data.signed_up || 0,
      excerpt: data.description || '',
      description_html: data.description_html || data.description || ''
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.message || '加载活动详情失败'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (isFull.value) return
  if (!requireLogin()) return

  try {
    await registerEvent(id)
    alert('报名成功，等待审核')
    await loadEventDetail()
  } catch (e) {
    console.error(e)
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      '报名失败'
    alert(msg)
  }
}

onMounted(() => {
  loadEventDetail()
})
</script>

<style scoped>
.container{max-width:1200px;margin:24px auto;padding:0 18px}
.back{background:transparent;border:0;color:#0066cc;cursor:pointer;margin-bottom:12px}
.hero{display:flex;gap:20px;align-items:stretch}
.hero-left{flex:1}
.hero-left img{width:100%;height:420px;object-fit:cover;border-radius:8px;display:block}
.hero-right{width:320px;display:flex;flex-direction:column;gap:14px}
.date-card{background:#123e8a;color:#fff;padding:16px;border-radius:8px;display:flex;align-items:center;gap:12px}
.date-card .day{font-size:48px;font-weight:700;line-height:1}
.date-card .month-year{font-size:14px;opacity:0.9}
.info-card{background:#fff;padding:16px;border-radius:8px}
.info-card .title{margin:0 0 8px 0;font-size:1.2rem}
.meta{color:#666;margin-bottom:8px}
.excerpt{color:#444;margin-bottom:10px}
.stats{margin-bottom:10px}
.actions{display:flex;gap:10px;align-items:center}
.btn{padding:8px 14px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer}
.btn.primary{background:#0070d1;color:#fff;border-color:#0062b0}
.small-card{background:#f7f9fc;padding:12px;border-radius:8px}
.description{background:#fff;padding:18px;border-radius:8px;margin-top:18px}
@media(max-width:900px){.hero{flex-direction:column}.hero-left img{height:220px}.hero-right{width:100%}}
</style>
