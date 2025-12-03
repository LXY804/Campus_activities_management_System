<template>
  <div class="page events-list" :style="bgStyle">
    <!-- 半透明遮罩，提升文字可读性 -->
    <div class="bg-overlay"></div>

    <div class="content">
      <NavBar />

      <div class="container">
        <h2 class="page-title"></h2>
        <!-- tabs -->
        <div class="tabs">
          <div class="tabs-left">
            <div
              v-for="(t, idx) in tabs"
              :key="t"
              class="tab"
              :class="{ active: activeTab === idx }"
              @click="setTab(idx)">
              {{ t }}
            </div>
          </div>
          <!-- 活动分类筛选 -->
          <div class="filter-section">

            <select 
              v-model="selectedTypeId" 
              class="type-select"
              @change="handleTypeChange"
            >
              <option value="">全部类型</option>
              <option 
                v-for="type in activityTypes" 
                :key="type.id" 
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="cards" v-if="!loading && !errorMsg && filteredEvents.length">
          <div v-for="ev in filteredEvents" :key="ev.id" class="card">

            <div class="card-bg" :style="cardBgStyle"></div>

            <div class="card-header">活动编号：{{ ev.code }}</div>

            <div class="card-body">
              <div class="left" @click="open(ev.id)">
                <img :src="ev.image" alt="活动图片" @error="handleImageError($event)" />
                <div class="status">{{ ev.statusText }}</div>
              </div>

              <div class="center" @click="open(ev.id)">
                <h3 class="title">{{ ev.title }}</h3>
                <p class="meta">参与人数：{{ ev.signed_up }} </p>

                <div class="bottom-meta">
                  <span>学院：{{ ev.college }}</span>
                  <span>关键字：{{ ev.keywords }}</span>
                  <span>地点：{{ ev.location }}</span>
                  <span>时间：{{ ev.time }}</span>
                </div>
              </div>

              <div class="right">
                <button class="btn green" @click.prevent="cta(ev)">{{ ev.cta }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="loading">加载中...</div>
        <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-else class="loading">暂无活动数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gradImg from '@/assets/graduation.png'
import libraryImg from '@/assets/图书馆.webp'
import { fetchEvents, fetchActivityTypes } from '@/api/event'

// 后端基础地址，用于拼接封面图片等静态资源完整 URL
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

// 构建图片URL
const buildImageUrl = (coverUrl) => {
  if (!coverUrl || coverUrl === '' || coverUrl === 'null' || coverUrl === 'undefined') {
    return gradImg
  }
  // 如果已经是完整URL，直接返回
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
    return coverUrl
  }
  // 兼容 Windows 反斜杠路径
  let normalized = coverUrl.replace(/\\/g, '/')
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  // 如果是相对路径，拼接API基础地址
  return API_ORIGIN + normalized
}

const bgStyle = {
  backgroundImage: `url(${libraryImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  minHeight: '100vh'
}

const router = useRouter()

// 标签页选项
const tabs = ['全部', '进行中', '未开始',  '已结束']

// 当前选中的标签页索引
const activeTab = ref(0)

const events = ref([])
const loading = ref(false)
const errorMsg = ref('')
const activityTypes = ref([])
const selectedTypeId = ref('')

const statusLabelMap = {
  open: '进行中',
  ongoing: '进行中',
  upcoming: '未开始',
  to_review: '待评价',
  finished: '已结束',
  ended: '已结束',
  cancelled: '已取消'
}

const ctaMap = {
  open: '点击报名',
  ongoing: '点击报名',
  upcoming: '查看详情',
  finished: '去评价',
  to_review: '去评价',
  ended: '已结束，查看评价'
}

const formatTimeRange = (start, end) => {
  if (!start) return ''
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null
  const pad = (v) => String(v).padStart(2, '0')
  const startStr = `${pad(startDate.getMonth() + 1)}月${pad(startDate.getDate())}日 ${pad(
    startDate.getHours()
  )}:${pad(startDate.getMinutes())}`
  if (!endDate) return startStr
  const endStr = `${pad(endDate.getMonth() + 1)}月${pad(endDate.getDate())}日 ${pad(
    endDate.getHours()
  )}:${pad(endDate.getMinutes())}`
  return `${startStr} - ${endStr}`
}

const loadEvents = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {}
    if (selectedTypeId.value) {
      params.category_id = selectedTypeId.value
    }
    const data = await fetchEvents(params)
    events.value =
      data?.list?.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        image: buildImageUrl(item.cover_url),
        signed_up: item.signed_up || 0,
        college: item.organizer_name || '校园活动中心',
        keywords: item.excerpt || '',
        location: item.location,
        time: formatTimeRange(item.start_time, item.end_time),
        status: item.status,
        statusText: statusLabelMap[item.status] || '进行中',
        cta: ctaMap[item.status] || '查看详情',
        type_id: item.type_id
      })) || []
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || '加载活动失败'
  } finally {
    loading.value = false
  }
}

const loadActivityTypes = async () => {
  try {
    const types = await fetchActivityTypes()
    activityTypes.value = types || []
  } catch (err) {
    console.error('加载活动类型失败:', err)
  }
}

const handleTypeChange = () => {
  loadEvents()
}

onMounted(() => {
  loadActivityTypes()
  loadEvents()
})

function open(id) {
  router.push({ name: 'EventInfo', params: { id } }).catch(() => {})
}

function cta(ev) {
  // 如果活动已结束，跳转到评论页面；否则跳转到详情页
  if (ev.status === 'ended' || ev.status === 'finished') {
    router.push({ name: 'EventComments', params: { id: ev.id } }).catch(() => {})
  } else {
    open(ev.id)
  }
}

function setTab(idx) {
  activeTab.value = idx
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认图片
  if (event.target.src !== gradImg) {
    event.target.src = gradImg
  }
}

const statusMap = {
  '进行中': 'open',
  '未开始': 'upcoming',
  '待评价': 'to_review',
  '已结束': 'ended'
}

const filteredEvents = computed(() => {
  let result = events.value
  // 按状态筛选
  if (activeTab.value !== 0) {
    const key = tabs[activeTab.value]
    const status = statusMap[key]
    if (status) {
      result = result.filter(e => e.status === status)
    }
  }
  return result
})

// 卡片背景样式（共用图）
const cardBgStyle = {
  backgroundImage: `url(${libraryImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  transform: 'scale(1.02)'
}
</script>

<style scoped>
.container{max-width:1100px;margin:18px auto;padding:0 16px;background-color: rgba(255,255,255,0.8);border-radius:8px;padding-bottom:24px}
.page-title{font-size:22px;margin:12px 0;font-weight:700;color:#333}
.tabs{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 12px;background:rgba(255,255,255,0.9);border-radius:6px;margin-bottom:12px;flex-wrap:wrap}
.tabs-left{display:flex;gap:28px;flex:1}
.tab{padding:8px 10px;cursor:pointer;color:#233;border-bottom:3px solid transparent;font-weight:600}
.tab.active{color:#0b4ea2;border-bottom-color:#0b4ea2}
.type-select{padding:8px 12px;border:1px solid #ddd;border-radius:4px;background:#fff;font-size:15px;color:#333;cursor:pointer;min-width:150px;transition:border-color 0.2s}
.type-select:focus{outline:none;border-color:#0b4ea2}
.cards{display:flex;flex-direction:column;gap:18px;min-height:200px}
.loading,.error{padding:40px;text-align:center;color:#666}
.card{border:1px solid #e2e8f0;background:transparent}
.card-header{background:#e8f3ff;padding:12px 16px;font-weight:600}
.card-body{display:flex;gap:18px;align-items:center;padding:18px;background:rgba(255,255,255,0.9)}
.left{width:160px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;cursor:pointer}
.left img{width:140px;height:100px;object-fit:cover;border-radius:4px;background:#a8bed8}
.status{font-size:14px;color:#333}
.center{flex:1;cursor:pointer}
.title{margin:0 0 8px 0;font-size:18px}
.meta{color:#333;margin:0 0 10px 0}
.bottom-meta{display:flex;gap:18px;color:#444;font-size:14px;margin-top:8px;flex-wrap:wrap}
.right{width:120px;display:flex;align-items:center;justify-content:center}
.btn{padding:10px 18px;border-radius:8px;border:0;cursor:pointer}
.btn.green{background:#66bb33;color:#fff;font-weight:700}

/* 背景与遮罩 */
.page.events-list{position:relative}
.bg-overlay{position:absolute;inset:0;background:rgba(255,255,255,0.6);pointer-events:none}
.content{position:relative;z-index:2}

@media(max-width:800px){
  .card-body{flex-direction:column;align-items:flex-start}
  .right{width:100%;display:flex;justify-content:flex-end}
}
</style>
