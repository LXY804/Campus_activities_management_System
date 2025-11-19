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
import gradImg from '@/assets/graduation.png'

const router = useRouter()
const route = useRoute()
const id = route.params.id || 1

const event = ref({})

const formattedDate = computed(() => {
  if (!event.value.date) return ''
  return new Date(event.value.date).toLocaleString()
})

const day = computed(() => event.value.date ? new Date(event.value.date).getDate() : '')
const month = computed(() => event.value.date ? (new Date(event.value.date).getMonth() + 1) + '月' : '')
const year = computed(() => event.value.date ? new Date(event.value.date).getFullYear() : '')

const isFull = computed(() => event.value.capacity && event.value.signed_up >= event.value.capacity)

function goBack() { router.back() }

function handleRegister() {
  if (isFull.value) return
  // 简单示例：本地提示
  alert('报名请求已发送（示例）')
}

onMounted(() => {
  // 使用 mock 数据展示，按 id 返回对应的活动信息（后续替换为接口请求）
  const mockEvents = {
    '1': {
      id: 1,
      title: '毕业典礼志愿者招募',
      date: '2025-12-01T09:00:00',
      location: '体育馆主会场',
      image: gradImg,
      organizer: '学生会',
      capacity: 300,
      signed_up: 56,
      excerpt: '加入志愿团队，为毕业生送上温暖与秩序。',
      description_html: '<p>欢迎加入毕业典礼志愿者团队，我们将为你提供培训、餐饮与志愿者证书。</p><p>岗位包括签到引导、会场秩序维护、舞台协助与来宾接待等。</p>'
    },
    '2': {
      id: 2,
      title: '校园文化节讲座',
      date: '2025-06-01T14:00:00',
      location: '报告厅A',
      image: gradImg,
      organizer: '人文学院',
      capacity: 120,
      signed_up: 78,
      excerpt: '主题：当代文学与文化传承',
      description_html: '<p>邀请校内外专家学者，探讨文学与文化传承的当代价值。</p>'
    },
    '3': {
      id: 3,
      title: '图书馆读书交流会',
      date: '2025-06-20T18:00:00',
      location: '图书馆多功能厅',
      image: gradImg,
      organizer: '图书馆',
      capacity: 50,
      signed_up: 12,
      excerpt: '分享好书，交流读书心得。',
      description_html: '<p>欢迎所有喜欢阅读的同学参加，现场将有小范围的沙龙讨论。</p>'
    }
  }

  // 读取对应 id 的 mock 数据，若不存在则展示默认项
  const picked = mockEvents[String(id)]
  if (picked) {
    event.value = picked
  } else {
    event.value = {
      id,
      title: '未找到的活动',
      date: '',
      location: '',
      image: gradImg,
      organizer: '',
      capacity: 0,
      signed_up: 0,
      excerpt: '未能加载该活动的详细信息。',
      description_html: '<p>抱歉，无法找到指定的活动。</p>'
    }
  }
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
