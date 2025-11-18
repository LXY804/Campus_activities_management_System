<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar__title">管理后台</div>
      <nav class="sidebar__menu">
        <a class="sidebar__item active">审核活动发布</a>
        <a class="sidebar__item">用户管理</a>
        <a class="sidebar__item">系统配置</a>
        <a class="sidebar__item">数据统计</a>
      </nav>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div>
          <h1>管理后台</h1>
          <p>系统审核、用户管理与平台统计</p>
        </div>
        <div class="admin-user">
          <button class="bell">🔔</button>
          <div class="avatar">管理员</div>
        </div>
      </header>

      <section class="admin-grid">
        <article class="admin-card">
          <h3>待审核活动</h3>
          <p class="admin-card__value">6</p>
          <p class="admin-card__desc">提交待审核，需尽快处理</p>
        </article>
        <article class="admin-card">
          <h3>本月新增用户</h3>
          <p class="admin-card__value">128</p>
          <p class="admin-card__desc">较上月提升 24%</p>
        </article>
        <article class="admin-card">
          <h3>系统运行状态</h3>
          <p class="admin-card__value status good">正常</p>
          <p class="admin-card__desc">服务全部可用</p>
        </article>
      </section>

      <section class="admin-panels">
        <article class="panel">
          <header>
            <h2>活动审核队列</h2>
            <button>查看全部</button>
          </header>
          <ul>
            <li v-for="item in reviewList" :key="item.name">
              <div>
                <h3>{{ item.name }}</h3>
                <p>{{ item.club }} · {{ item.time }}</p>
              </div>
              <span class="status-tag" :class="item.level">{{ item.levelLabel }}</span>
            </li>
          </ul>
        </article>

        <article class="panel">
          <header>
            <h2>用户概览</h2>
            <span>{{ userSummary.total }} 人</span>
          </header>
          <div class="user-summary">
            <div v-for="item in userSummary.breakdown" :key="item.label">
              <div class="value">{{ item.value }}</div>
              <div class="label">{{ item.label }}</div>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
const reviewList = [
  { name: 'AI 创新讲习营', club: '计算机协会', time: '今日 10:21', level: 'warn', levelLabel: '优先' },
  { name: '音乐剧社迎新', club: '音乐剧社', time: '昨日 16:43', level: 'info', levelLabel: '普通' },
  { name: '可持续校园行动', club: '环保社', time: '昨日 09:18', level: 'info', levelLabel: '普通' }
]

const userSummary = {
  total: 4236,
  breakdown: [
    { label: '学生用户', value: 3680 },
    { label: '组织者', value: 420 },
    { label: '管理员', value: 136 }
  ]
}
</script>

<style scoped>
.admin-layout{
  display:flex;
  min-height:100vh;
  background:#f7f7fb;
  color:#2c2c2c;
}
.sidebar{
  width:220px;
  background:#fff;
  box-shadow:5px 0 20px rgba(0,0,0,.05);
  padding:30px 18px;
}
.sidebar__title{
  font-size:22px;
  font-weight:700;
  color:#6a5cf8;
  margin-bottom:24px;
}
.sidebar__menu{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.sidebar__item{
  padding:12px 14px;
  border-radius:10px;
  color:#666;
  text-decoration:none;
  font-size:15px;
  cursor:pointer;
  transition:all .2s;
}
.sidebar__item.active,
.sidebar__item:hover{
  background:#6a5cf8;
  color:#fff;
  font-weight:600;
}
.admin-content{
  flex:1;
  padding:32px;
}
.admin-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:24px;
}
.admin-user{
  display:flex;
  gap:16px;
  align-items:center;
}
.bell{
  border:none;
  background:#fff;
  border-radius:12px;
  width:44px;
  height:44px;
  font-size:20px;
  cursor:pointer;
  box-shadow:0 5px 20px rgba(0,0,0,0.08);
}
.avatar{
  padding:10px 18px;
  border-radius:999px;
  background:#6e60f9;
  color:#fff;
  font-weight:600;
  box-shadow:0 8px 20px rgba(110,96,249,.3);
}
.admin-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:20px;
}
.admin-card{
  background:#fff;
  border-radius:16px;
  padding:20px;
  box-shadow:0 10px 25px rgba(0,0,0,0.06);
}
.admin-card__value{
  font-size:32px;
  font-weight:700;
  margin:16px 0 6px;
}
.admin-card__desc{
  color:#888;
  font-size:14px;
}
.admin-card .status{
  display:inline-block;
  padding:4px 14px;
  border-radius:999px;
  font-size:15px;
}
.status.good{
  background:#d0ffe8;
  color:#0f9961;
}
.admin-panels{
  margin-top:30px;
  display:grid;
  grid-template-columns:2fr 1fr;
  gap:24px;
}
.panel{
  background:#fff;
  border-radius:18px;
  padding:22px;
  box-shadow:0 10px 30px rgba(0,0,0,0.06);
}
.panel header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:18px;
}
.panel header button{
  border:none;
  background:#f1efff;
  color:#6a5cf8;
  padding:6px 16px;
  border-radius:999px;
  cursor:pointer;
  font-weight:600;
}
.panel ul{
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:16px;
}
.panel li{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding-bottom:14px;
  border-bottom:1px solid #f0f0f5;
}
.panel li:last-child{
  border-bottom:none;
  padding-bottom:0;
}
.panel li h3{
  margin-bottom:6px;
}
.panel li p{
  color:#999;
  font-size:13px;
}
.status-tag{
  padding:6px 14px;
  border-radius:999px;
  font-size:13px;
  font-weight:600;
}
.status-tag.warn{
  background:#ffe9e2;
  color:#f2662f;
}
.status-tag.info{
  background:#eef2ff;
  color:#5b62f4;
}
.user-summary{
  display:flex;
  justify-content:space-between;
  text-align:center;
}
.user-summary .value{
  font-size:24px;
  font-weight:700;
}
.user-summary .label{
  color:#8a8a9c;
  margin-top:4px;
}
@media (max-width:1200px){
  .admin-layout{
    flex-direction:column;
  }
  .sidebar{
    width:100%;
    display:flex;
    flex-direction:row;
    gap:10px;
    align-items:center;
    justify-content:space-between;
  }
  .sidebar__menu{
    flex-direction:row;
    flex-wrap:wrap;
  }
  .admin-grid{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
  .admin-panels{
    grid-template-columns:1fr;
  }
}
</style>

