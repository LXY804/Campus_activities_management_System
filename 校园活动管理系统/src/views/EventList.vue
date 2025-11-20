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
          <div
            v-for="(t, idx) in tabs"
            :key="t"
            class="tab"
            :class="{ active: activeTab === idx }"
            @click="setTab(idx)">
            {{ t }}
          </div>
        </div>

        <div class="cards">
          <div v-for="ev in filteredEvents" :key="ev.id" class="card">

            <div class="card-bg" :style="cardBgStyle"></div>

            <div class="card-header">活动编号：{{ ev.code }}</div>

            <div class="card-body">
              <div class="left" @click="open(ev.id)">
                <img :src="ev.image" alt="活动图片" />
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
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import gradImg from '@/assets/graduation.png'
// 背景图片（请确保该文件存在于 src/assets）
import libraryImg from '@/assets/图书馆.webp'

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
const tabs = ['全部', '进行中', '未开始', '待评价', '已结束']

// 当前选中的标签页索引
const activeTab = ref(0)

// mock 数据，后续可替换为接口请求
const events = ref([
  {
    id: 1,
    code: '7717789',
    title: '社团迎新志愿服务活动',
    image: gradImg,
    signed_up: 7,
    college: '计算机学院',
    keywords: '志愿,迎新',
    location: '主楼广场',
    time: '05月12日 09:00-12:00',
    status: 'open',
    statusText: '进行中',
    cta: '点击报名'
  },
  {
    id: 2,
    code: '7717790',
    title: '校园文化节讲座',
    image: gradImg,
    signed_up: 7,
    college: '人文学院',
    keywords: '讲座,文化节',
    location: '报告厅A',
    time: '06月01日 14:00-16:00',
    status: 'ended',
    statusText: '已结束',
    cta: '点击评价'
  },
  {
    id: 3,
    code: '7717791',
    title: '图书馆读书交流会',
    image: gradImg,
    signed_up: 12,
    college: '图书馆',
    keywords: '读书,交流',
    location: '图书馆多功能厅',
    time: '06月20日 18:00-20:00',
    status: 'upcoming',
    statusText: '未开始',
    cta: '查看详情'
  },
  {
    id: 4,
    code: '7717792',
    title: '校园环保志愿活动',
    image: gradImg,
    signed_up: 25,
    college: '环境学院',
    keywords: '环保,志愿',
    location: '东侧绿地',
    time: '05月20日 08:30-11:30',
    status: 'open',
    statusText: '进行中',
    cta: '点击报名'
  },
  {
    id: 5,
    code: '7717793',
    title: '学生创业大赛路演',
    image: gradImg,
    signed_up: 40,
    college: '经管学院',
    keywords: '创业,比赛',
    location: '创客中心',
    time: '04月30日 13:00-17:00',
    status: 'to_review',
    statusText: '待评价',
    cta: '去评价'
  },
  {
    id: 6,
    code: '7717794',
    title: '运动会志愿者招募',
    image: gradImg,
    signed_up: 58,
    college: '体育学院',
    keywords: '运动,志愿',
    location: '体育场',
    time: '07月10日 07:30-12:00',
    status: 'upcoming',
    statusText: '未开始',
    cta: '查看详情'
  }
])

function open(id) {
  router.push({ name: 'EventInfo', params: { id } }).catch(() => {})
}

function cta(ev) {
  // 简单交互：先跳转到详情页，用户可在详情页操作报名或评价
  open(ev.id)
}

function setTab(idx) {
  activeTab.value = idx
}

import { computed } from 'vue'

const statusMap = {
  '进行中': 'open',
  '未开始': 'upcoming',
  '待评价': 'to_review',
  '已结束': 'ended'
}

const filteredEvents = computed(() => {
  if (activeTab.value === 0) return events.value
  const key = tabs[activeTab.value]
  const status = statusMap[key]
  if (!status) return events.value
  return events.value.filter(e => e.status === status)
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
.page-title{font-size:22px;margin:12px 0}
.tabs{display:flex;gap:28px;padding:10px 12px;background:rgba(255,255,255,0.9);border-radius:6px;margin-bottom:12px}
.tab{padding:8px 10px;cursor:pointer;color:#233;border-bottom:3px solid transparent;font-weight:600}
.tab.active{color:#0b4ea2;border-bottom-color:#0b4ea2}
.cards{display:flex;flex-direction:column;gap:18px}
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
