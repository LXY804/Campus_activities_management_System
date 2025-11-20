<template>
  <div class="page">
    <NavBar />

    <!-- Hero -->
    <div class="activity-container">
      <div class="image-section">
        <img :src="gradImg" alt="毕业照" />
      </div>
      <div class="content-section">
        <h2>毕业典礼志愿者招募</h2>
        <p>
          迎新不如送别——加入毕业典礼志愿者团队，与我们一起为毕业生打造温暖、有序、难忘的仪式！岗位包括签到引导、会场秩序维护、舞台协助与来宾接待，不需要专业经验，我们提供培训与当天午餐、志愿者证书与纪念品。欢迎同学们积极报名，共同见证这一重要时刻！
        </p>
        <p>
          学校将于 2025 年 12 月 1 日举办毕业典礼。现面向全校招募志愿者，诚邀热情、有责任心的你加入志愿服务团队，为毕业生和来宾提供贴心服务，帮助活动顺利进行。
        </p>
        <p>
            岗位要求：
            年满18岁，具备良好的时间观念与沟通能力；
            能按时参加活动前的 1 次培训与全程值守（具体时段会另行通知）；
            有团队协作精神，遇突发情况能冷静处理并服从组织安排。
        </p>
        <a @click.prevent="gotoEvent(heroEventId)" href="#" class="btn">查看详情 <span class="arrow">→</span></a>
      </div>
    </div>

    <!-- 下方活动列表 -->
    <section class="events-list">
      <h3>更多活动</h3>
      <div class="events-grid">
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
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import gradImg from '@/assets/graduation.png'

const router = useRouter()

// hero 按钮跳转的示例 id
const heroEventId = 1

// 模拟下方多个活动数据，后续可替换成接口请求
const events = ref([
  { id: 1, title: '迎新晚会', date: '2025-12-01', location: '学生活动中心', image: gradImg, excerpt: '热闹的迎新晚会，欢迎新同学加入我们。' },
  { id: 2, title: '志愿者招募', date: '2025-12-05', location: '图书馆广场', image: gradImg, excerpt: '低门槛，高意义，加入志愿者行列。' },
  { id: 3, title: '学术讲座', date: '2025-12-10', location: '二号报告厅', image: gradImg, excerpt: '邀请知名教授前来演讲，开放报名。' },
  { id: 4, title: '运动会', date: '2026-01-08', location: '体育场', image: gradImg, excerpt: '校园运动会，团队竞技，热血沸腾。' },
  { id: 5, title: '摄影比赛', date: '2026-01-20', location: '美术馆', image: gradImg, excerpt: '展示你的镜头下的校园故事。' },
  { id: 6, title: '创客市集', date: '2026-02-10', location: '创新广场', image: gradImg, excerpt: '创意与手作的集市，摊位招募中。' }
])

function gotoEvent(id) {
  // 如果你已经有 /event/:id 路由，跳转到详情页
  router.push({ name: 'EventInfo', params: { id } }).catch(() => {
    // 若未注册 EventInfo 路由，回退到 promotion
    router.push('/promotion')
  })
}
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
  align-self: flex-end; /* 底部与蓝色区域对齐 */
  transform: translateY(-60px); /* 向上凸出一点 */
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
  .image-section { flex-basis: 320px; transform: translateY(-18px); }
  .content-section h2 { font-size: 2rem; }
}

@media (max-width: 600px) {
  .activity-container { flex-direction: column; padding: 18px; }
  .image-section { transform: translateY(0); width: 100%; flex-basis: auto; }
  .content-section { padding: 18px 8px; }
}

.events-list{max-width:1200px;margin:28px auto;padding:0 18px}
.events-list h3{max-width:1200px;margin:0 0 14px 18px;font-size:1.4rem;color:#123}
.events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.event-card{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);display:flex;flex-direction:column}
.card-thumb img{width:100%;height:160px;object-fit:cover;display:block}
.card-body{padding:12px 14px;flex:1;display:flex;flex-direction:column}
.card-body h4{margin:0 0 6px;font-size:1.05rem}
.card-body .meta{color:#666;font-size:0.9rem;margin-bottom:8px}
.card-body .excerpt{flex:1;color:#444;font-size:0.95rem}
.card-actions{margin-top:12px;display:flex;justify-content:flex-end}


</style>