<template>
  <NavBar />
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar__title">管理后台</div>
      <nav class="sidebar__menu">
        <a 
          class="sidebar__item" 
          :class="{ active: activeMenu === 'review' }"
          @click="activeMenu = 'review'"
        >审核活动发布</a>
        <a 
          class="sidebar__item"
          :class="{ active: activeMenu === 'users' }"
          @click="activeMenu = 'users'"
        >用户管理</a>
        <a 
          class="sidebar__item"
          :class="{ active: activeMenu === 'config' }"
          @click="activeMenu = 'config'"
        >系统配置</a>
        <a 
          class="sidebar__item"
          :class="{ active: activeMenu === 'stats' }"
          @click="activeMenu = 'stats'"
        >数据统计</a>
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
          <p class="admin-card__value">{{ reviewList.length }}</p>
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
        <!-- 审核活动发布面板 -->
        <div v-if="activeMenu === 'review'" class="review-container">
          <article class="panel">
            <header>
              <h2>活动审核队列</h2>
              <button>查看全部</button>
            </header>
            <ul>
              <li v-for="(item, idx) in reviewList" :key="item.name">
                <div>
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.club }} · {{ item.time }}</p>
                </div>
                <div class="review-actions">
                  <button 
                    class="btn btn-approve" 
                    @click="approveActivity(idx)"
                    title="通过审核"
                  >✓ 通过</button>
                  <button 
                    class="btn btn-reject" 
                    @click="rejectActivity(idx)"
                    title="驳回审核"
                  >✗ 驳回</button>
                </div>
              </li>
            </ul>
          </article>

          <!-- 用户概览（仅在审核活动时显示） -->
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
        </div>

        <!-- 用户管理面板 -->
        <article class="panel" v-if="activeMenu === 'users'">
          <header>
            <h2>用户管理</h2>
            <button>导出用户数据</button>
          </header>
          <div class="user-management">
            <div class="user-stat">
              <div class="stat-box">
                <div class="stat-value">3680</div>
                <div class="stat-label">学生用户</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">420</div>
                <div class="stat-label">组织者</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">136</div>
                <div class="stat-label">管理员</div>
              </div>
            </div>

            <!-- 搜索和过滤器 -->
            <div class="user-filters">
              <div class="filter-row">
                <input 
                  v-model="userSearchKey" 
                  type="text" 
                  placeholder="搜索用户名..." 
                  class="search-input"
                />
                <select 
                  v-model="userFilterRole"
                  class="role-select"
                >
                  <option value="全部">全部角色</option>
                  <option value="学生用户">学生用户</option>
                  <option value="组织者">组织者</option>
                  <option value="管理员">管理员</option>
                </select>
              </div>
            </div>

            <!-- 过滤结果统计 -->
            <div class="filter-result">
              找到 <strong>{{ filteredUsers.length }}</strong> 条结果
            </div>

            <!-- 用户列表 -->
            <ul class="user-list">
              <li v-for="(user, idx) in filteredUsers" :key="idx">
                <div class="user-info">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                  <div>
                    <h4>{{ user.name }}</h4>
                    <p>{{ user.role }}</p>
                  </div>
                </div>
                <div class="user-meta">
                  <span>{{ user.joinDate }}</span>
                </div>
              </li>
              <li v-if="filteredUsers.length === 0" class="no-result">
                <p>没有找到匹配的用户</p>
              </li>
            </ul>
          </div>
        </article>

        <!-- 系统配置面板 -->
        <article class="panel" v-if="activeMenu === 'config'">
          <header>
            <h2>系统配置</h2>
            <button>保存设置</button>
          </header>
          <div class="config-panel">
            <div class="config-item">
              <label>最大活动人数限制</label>
              <input type="number" value="500" />
            </div>
            <div class="config-item">
              <label>审核活动超时时间（小时）</label>
              <input type="number" value="48" />
            </div>
            <div class="config-item">
              <label>启用邮件通知</label>
              <input type="checkbox" checked />
            </div>
            <div class="config-item">
              <label>维护模式</label>
              <input type="checkbox" />
            </div>
          </div>
        </article>

        <!-- 数据统计面板 -->
        <article class="panel" v-if="activeMenu === 'stats'">
          <header>
            <h2>数据统计</h2>
            <button>导出报告</button>
          </header>
          <div class="stats-panel">
            <div class="stat-card">
              <h4>本月活动统计</h4>
              <div class="stat-numbers">
                <div class="number">{{ monthStats.activities }}</div>
                <p>新增活动</p>
              </div>
            </div>
            <div class="stat-card">
              <h4>用户参与度</h4>
              <div class="stat-numbers">
                <div class="number">{{ monthStats.participation }}%</div>
                <p>参与率</p>
              </div>
            </div>
            <div class="stat-card">
              <h4>平均评分</h4>
              <div class="stat-numbers">
                <div class="number">{{ monthStats.rating }}</div>
                <p>★</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'

// 当前活动菜单
const activeMenu = ref('review')

// 响应式 reviewList，用于审核队列
const reviewList = ref([
  { name: 'AI 创新讲习营', club: '计算机协会', time: '今日 10:21', level: 'warn', levelLabel: '优先' },
  { name: '音乐剧社迎新', club: '音乐剧社', time: '昨日 16:43', level: 'info', levelLabel: '普通' },
  { name: '可持续校园行动', club: '环保社', time: '昨日 09:18', level: 'info', levelLabel: '普通' }
])

// 通过审核
const approveActivity = (index) => {
  const activity = reviewList.value[index]
  reviewList.value.splice(index, 1)
  showNotification(`✓ 已通过"${activity.name}"的审核`, 'success')
}

// 驳回审核
const rejectActivity = (index) => {
  const activity = reviewList.value[index]
  reviewList.value.splice(index, 1)
  showNotification(`✗ 已驳回"${activity.name}"的审核请求`, 'warning')
}

// 全局通知（临时实现，后续会用 Toast 组件替代）
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  document.body.appendChild(notification)
  
  // 自动消失
  setTimeout(() => {
    notification.classList.add('notification-hide')
    setTimeout(() => notification.remove(), 300)
  }, 2500)
}

// 用户管理的搜索和过滤
const userSearchKey = ref('')
const userFilterRole = ref('全部')
const roleOptions = ['全部', '学生用户', '组织者', '管理员']

const userList = ref([
  { name: '张三', role: '学生用户', joinDate: '2024-09-15' },
  { name: '李四', role: '组织者', joinDate: '2024-08-22' },
  { name: '王五', role: '学生用户', joinDate: '2024-10-03' },
  { name: '赵六', role: '管理员', joinDate: '2024-07-10' },
  { name: '孙七', role: '学生用户', joinDate: '2024-11-01' },
  { name: '鱼鱼鱼', role: '学生用户', joinDate: '202-1-01' }
])

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  return userList.value.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(userSearchKey.value.toLowerCase())
    const matchRole = userFilterRole.value === '全部' || user.role === userFilterRole.value
    return matchSearch && matchRole
  })
})

const monthStats = {
  activities: 42,
  participation: 78,
  rating: 4.6
}

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
}

.review-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
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
  padding:14px;
  border-radius:10px;
  background:#f9f9fd;
  transition:all 0.2s;
  border-bottom:none;
  margin-bottom:0;
  gap:16px;
}

.panel li:hover {
  background: #f0f0ff;
  transform: translateX(4px);
}

.panel li:last-child{
  border-bottom:none;
  padding-bottom:14px;
}
.panel li h3{
  margin-bottom:6px;
}
.panel li p{
  color:#999;
  font-size:13px;
}

/* 审核操作按钮 */
.review-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-approve {
  background: #d0ffe8;
  color: #0f9961;
}

.btn-approve:hover {
  background: #a8f5d0;
  transform: scale(1.05);
}

.btn-reject {
  background: #ffe9e2;
  color: #f2662f;
}

.btn-reject:hover {
  background: #ffd4c4;
  transform: scale(1.05);
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

/* 用户管理面板样式 */
.user-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-stat {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-box {
  background: #f8f8fc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #6a5cf8;
}

.stat-label {
  color: #8a8a9c;
  font-size: 13px;
  margin-top: 6px;
}

.user-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background: #f8f8fc;
  transition: all 0.2s;
}

.user-list li:hover {
  background: #eef2ff;
  transform: translateX(4px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6a5cf8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-list h4 {
  margin: 0;
  font-size: 14px;
}

.user-list p {
  color: #999;
  font-size: 12px;
  margin: 4px 0 0 0;
}

.user-meta {
  color: #999;
  font-size: 12px;
}

/* 用户搜索和过滤 */
/* 用户搜索和过滤 */
.user-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 11px 14px 11px 40px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #f9f9fd 100%);
  color: #2c2c2c;
  position: relative;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>');
  background-repeat: no-repeat;
  background-position: 12px center;
  background-size: 18px;
  padding-left: 40px;
}

.search-input:hover {
  border-color: #d0d0d0;
  background-color: #fafafc;
}

.search-input:focus {
  border-color: #6a5cf8;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(106, 92, 248, 0.08), 0 4px 12px rgba(106, 92, 248, 0.12);
}

.search-input::placeholder {
  color: #999;
}

.role-select {
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9fd 100%);
  color: #2c2c2c;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  min-width: 140px;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 18px;
  padding-right: 38px;
}

.role-select:hover {
  border-color: #d0d0d0;
  background-color: #fafafc;
}

.role-select:focus {
  border-color: #6a5cf8;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(106, 92, 248, 0.08), 0 4px 12px rgba(106, 92, 248, 0.12);
}

.role-select option {
  padding: 8px 12px;
  background: #fff;
  color: #2c2c2c;
}

/* 过滤结果统计 */
.filter-result {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f9f9fd;
  border-radius: 8px;
  border-left: 3px solid #6a5cf8;
}

.filter-result strong {
  color: #6a5cf8;
  font-weight: 700;
  font-size: 14px;
}

/* 没有结果提示 */
.no-result {
  text-align: center;
  padding: 40px 0 !important;
  color: #999 !important;
  background: none !important;
  border: none !important;
}

.no-result:hover {
  transform: none !important;
}

/* 系统配置面板样式 */
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #f8f8fc;
  border-radius: 10px;
}

.config-item label {
  color: #2c2c2c;
  font-weight: 500;
  font-size: 14px;
}

.config-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
}

.config-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6a5cf8;
}

/* 数据统计面板样式 */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f8f8fc;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 14px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.stat-numbers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-numbers .number {
  font-size: 28px;
  font-weight: 700;
  color: #6a5cf8;
}

.stat-numbers p {
  color: #999;
  font-size: 12px;
  margin: 6px 0 0 0;
}

/* 全局通知样式 */
:global(.notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideInRight 0.3s ease-out;
  max-width: 400px;
  word-break: break-word;
}

:global(.notification-success) {
  background: #d0ffe8;
  color: #0f9961;
  border-left: 4px solid #0f9961;
}

:global(.notification-warning) {
  background: #ffe9e2;
  color: #f2662f;
  border-left: 4px solid #f2662f;
}

:global(.notification-info) {
  background: #eef2ff;
  color: #5b62f4;
  border-left: 4px solid #5b62f4;
}

:global(.notification-hide) {
  animation: slideOutRight 0.3s ease-in forwards;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
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
  .review-container{
    grid-template-columns:1fr;
  }
}
</style>

