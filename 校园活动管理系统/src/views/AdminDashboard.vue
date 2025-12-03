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
          @click.prevent="switchToUsers"
        >用户管理</a>
        <a 
          class="sidebar__item"
          :class="{ active: activeMenu === 'config' }"
          @click.prevent="switchToConfig"
        >系统配置</a>
        <a 
          class="sidebar__item"
          :class="{ active: activeMenu === 'stats' }"
          @click.prevent="switchToStats"
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
          <p class="admin-card__value">{{ newUsersThisMonth.count }}</p>
          <p class="admin-card__desc" v-if="newUsersThisMonth.growthRate > 0">
            较上月提升 {{ newUsersThisMonth.growthRate }}%
          </p>
          <p class="admin-card__desc" v-else-if="newUsersThisMonth.growthRate < 0">
            较上月下降 {{ Math.abs(newUsersThisMonth.growthRate) }}%
          </p>
          <p class="admin-card__desc" v-else>
            与上月持平
          </p>
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
              <span>{{ userStats.total }} 人</span>
            </header>
            <div class="user-summary">
              <div>
                <div class="value">{{ userStats.students }}</div>
                <div class="label">学生用户</div>
              </div>
              <div>
                <div class="value">{{ userStats.organizers }}</div>
                <div class="label">组织者</div>
              </div>
              <div>
                <div class="value">{{ userStats.admins }}</div>
                <div class="label">管理员</div>
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
                <div class="stat-value">{{ userStats.students || 0 }}</div>
                <div class="stat-label">学生用户</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ userStats.organizers || 0 }}</div>
                <div class="stat-label">组织者</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">{{ userStats.admins || 0 }}</div>
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
                  @input="debouncedLoadUsers"
                />
                <select 
                  v-model="userFilterRole"
                  class="role-select"
                  @change="loadUsers"
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
              <li v-if="loadingUsers" class="no-result">
                <p>加载中...</p>
              </li>
              <li v-else v-for="(user, idx) in filteredUsers" :key="user.id || idx">
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
              <li v-if="!loadingUsers && filteredUsers.length === 0" class="no-result">
                <p>没有找到匹配的用户</p>
              </li>
            </ul>
          </div>
        </article>

        <!-- 系统配置面板 -->
        <article class="panel" v-if="activeMenu === 'config'">
          <header>
            <h2>系统配置</h2>
            <button @click="saveConfig" class="btn-save">💾 保存设置</button>
          </header>
          <div class="config-panel">
            <div class="config-item">
              <label>最大活动人数限制</label>
              <input 
                v-model.number="configForm.maxActivityPeople" 
                type="number" 
                min="10"
                max="10000"
              />
            </div>
            <div class="config-item">
              <label>审核活动超时时间（小时）</label>
              <input 
                v-model.number="configForm.reviewTimeout" 
                type="number"
                min="1"
                max="168"
              />
            </div>
            <div class="config-item">
              <label>启用邮件通知</label>
              <input 
                v-model="configForm.emailNotification" 
                type="checkbox" 
              />
            </div>
            <div class="config-item">
              <label>维护模式</label>
              <input 
                v-model="configForm.maintenanceMode" 
                type="checkbox" 
              />
            </div>
          </div>
        </article>

        <!-- 数据统计面板 -->
        <article class="panel" v-if="activeMenu === 'stats'">
          <header>
            <h2>数据统计</h2>
            <button class="btn-export">导出报告</button>
          </header>

          <!-- 时间范围选择 -->
          <div class="stats-date-picker">
            <label>选择月份：</label>
            <input 
              v-model="selectedMonth" 
              type="month"
              @change="updateStatsData"
              class="month-input"
            />
            <button @click="showAllData" class="btn-show-all">显示全部数据</button>
          </div>

          <!-- 统计数据卡片 -->
          <div class="stats-panel">
            <div class="stat-card">
              <h4>本月活动统计</h4>
              <div class="stat-numbers">
                <div class="number">{{ currentStats.activities }}</div>
                <p>新增活动</p>
              </div>
            </div>
            <div class="stat-card">
              <h4>用户参与度</h4>
              <div class="stat-numbers">
                <div class="number">{{ currentStats.participation }}%</div>
                <p>参与率</p>
              </div>
            </div>
            <div class="stat-card">
              <h4>平均评分</h4>
              <div class="stat-numbers">
                <div class="number">{{ currentStats.rating }}</div>
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
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { fetchPendingEvents, approveEvent, rejectEvent } from '@/api/event'
import { 
  fetchUserList, 
  fetchUserStats, 
  fetchNewUsersThisMonth,
  fetchSystemConfig,
  saveSystemConfig as saveSystemConfigApi,
  fetchActivityStats
} from '@/api/user'

// 当前活动菜单
const activeMenu = ref('review')

// 审核队列（从后端获取）
const reviewList = ref([])

// 概览统计数据
const newUsersThisMonth = ref({
  count: 0,
  growthRate: 0
})

const loadPendingEvents = async () => {
  try {
    const list = await fetchPendingEvents()
    reviewList.value = list.map((item) => ({
      creationId: item.creation_id,
      name: item.title,
      club: item.organizer_college || item.organizer_name || '组织者',
      time: item.submitted_at,
      raw: item
    }))
  } catch (e) {
    console.error('获取待审核活动失败:', e)
    showNotification('获取待审核活动失败，请稍后重试', 'warning')
  }
}

// 切换到用户管理
const switchToUsers = () => {
  activeMenu.value = 'users'
  // 延迟加载，确保菜单切换先完成
  setTimeout(() => {
    // 如果还没有加载过用户数据，则加载
    if (userList.value.length === 0 && !loadingUsers.value) {
      loadUsers()
    }
    if (userStats.value.total === 0 && userStats.value.students === 0) {
      loadUserStats()
    }
  }, 0)
}

// 切换到系统配置
const switchToConfig = () => {
  activeMenu.value = 'config'
  // 如果还没有加载过配置，则加载
  if (configForm.value.maxActivityPeople === 500 && configForm.value.reviewTimeout === 48) {
    loadSystemConfig()
  }
}

// 切换到数据统计
const switchToStats = () => {
  activeMenu.value = 'stats'
  // 如果当前统计数据为空，则加载
  if (currentStats.value.activities === 0 && currentStats.value.participation === 0) {
    loadActivityStats(selectedMonth.value)
  }
}

onMounted(() => {
  loadPendingEvents()
  loadUserStats() // 加载用户统计（用于概览卡片）
  loadNewUsersThisMonth() // 加载本月新增用户
  loadSystemConfig() // 加载系统配置
  loadActivityStats(selectedMonth.value) // 加载当前月份的统计数据
  // 如果初始菜单是用户管理，则加载数据
  if (activeMenu.value === 'users') {
    loadUsers()
  }
})

// 通过审核
const approveActivity = async (index) => {
  const activity = reviewList.value[index]
  try {
    await approveEvent(activity.creationId)
    reviewList.value.splice(index, 1)
    showNotification(`✓ 已通过 "${activity.name}" 的审核`, 'success')
  } catch (e) {
    console.error('审核通过失败:', e)
    showNotification('审核通过失败，请稍后重试', 'warning')
  }
}

// 驳回审核
const rejectActivity = async (index) => {
  const activity = reviewList.value[index]

  const remark = window.prompt(`请输入驳回 "${activity.name}" 的原因（可选）：`) || ''

  try {
    await rejectEvent(activity.creationId, remark)
    reviewList.value.splice(index, 1)
    showNotification(`✗ 已驳回 "${activity.name}" 的审核请求`, 'warning')
  } catch (e) {
    console.error('驳回审核失败:', e)
    showNotification('驳回审核失败，请稍后重试', 'warning')
  }
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
const userList = ref([])
const userStats = ref({
  total: 0,
  students: 0,
  organizers: 0,
  admins: 0
})
const loadingUsers = ref(false)

// 加载用户列表
const loadUsers = async () => {
  if (loadingUsers.value) return // 防止重复加载
  loadingUsers.value = true
  try {
    // 构建查询参数，只包含有值的参数
    const params = {}
    if (userSearchKey.value) {
      params.search = userSearchKey.value
    }
    if (userFilterRole.value && userFilterRole.value !== '全部') {
      params.role = userFilterRole.value
    }
    params.page = 1
    params.pageSize = 100
    
    console.log('请求用户列表，参数:', params)
    const data = await fetchUserList(params)
    console.log('用户列表响应数据:', data)
    
    // 确保正确处理返回的数据
    if (data && Array.isArray(data.list)) {
      userList.value = data.list
    } else if (Array.isArray(data)) {
      // 如果直接返回数组
      userList.value = data
    } else {
      userList.value = []
    }
    console.log('设置后的用户列表:', userList.value, '数量:', userList.value.length)
  } catch (e) {
    console.error('加载用户列表失败:', e)
    console.error('错误详情:', e.response?.data || e.message)
    console.error('错误状态码:', e.response?.status)
    // 显示错误通知，帮助调试
    const errorMsg = e.response?.data?.message || e.message || '未知错误'
    showNotification(`加载用户列表失败: ${errorMsg}`, 'warning')
    userList.value = [] // 确保设置为空数组
  } finally {
    loadingUsers.value = false
  }
}

// 加载用户统计
const loadUserStats = async () => {
  try {
    console.log('请求用户统计')
    const stats = await fetchUserStats()
    console.log('用户统计响应数据:', stats)
    userStats.value = stats || {
      total: 0,
      students: 0,
      organizers: 0,
      admins: 0
    }
    console.log('设置后的用户统计:', userStats.value)
  } catch (e) {
    console.error('加载用户统计失败:', e)
    console.error('错误详情:', e.response?.data || e.message)
    // 设置默认值，避免显示错误
    userStats.value = {
      total: 0,
      students: 0,
      organizers: 0,
      admins: 0
    }
  }
}

// 加载本月新增用户
const loadNewUsersThisMonth = async () => {
  try {
    const data = await fetchNewUsersThisMonth()
    newUsersThisMonth.value = {
      count: data?.newUsersThisMonth || 0,
      growthRate: data?.growthRate || 0
    }
  } catch (e) {
    console.error('加载本月新增用户失败:', e)
    newUsersThisMonth.value = {
      count: 0,
      growthRate: 0
    }
  }
}

// 计算过滤后的用户列表（现在后端已经过滤，这里直接返回）
const filteredUsers = computed(() => {
  return userList.value
})

// 防抖函数，用于搜索
let searchTimer = null
const debouncedLoadUsers = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadUsers()
  }, 500)
}

// 系统配置表单
const configForm = ref({
  maxActivityPeople: 500,
  reviewTimeout: 48,
  emailNotification: true,
  maintenanceMode: false
})

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    const data = await fetchSystemConfig()
    if (data) {
      configForm.value = {
        maxActivityPeople: data.maxActivityPeople || 500,
        reviewTimeout: data.reviewTimeout || 48,
        emailNotification: data.emailNotification !== undefined ? data.emailNotification : true,
        maintenanceMode: data.maintenanceMode || false
      }
    }
  } catch (e) {
    console.error('加载系统配置失败:', e)
    // 使用默认值
    configForm.value = {
      maxActivityPeople: 500,
      reviewTimeout: 48,
      emailNotification: true,
      maintenanceMode: false
    }
  }
}

// 保存系统配置
const saveConfig = async () => {
  // 验证表单
  if (configForm.value.maxActivityPeople < 10 || configForm.value.maxActivityPeople > 10000) {
    showNotification('最大活动人数必须在 10-10000 之间', 'warning')
    return
  }
  if (configForm.value.reviewTimeout < 1 || configForm.value.reviewTimeout > 168) {
    showNotification('审核超时时间必须在 1-168 小时之间', 'warning')
    return
  }
  
  try {
    await saveSystemConfigApi(configForm.value)
    showNotification('✓ 系统配置已保存', 'success')
  } catch (e) {
    console.error('保存系统配置失败:', e)
    showNotification('保存系统配置失败: ' + (e.response?.data?.message || e.message || '未知错误'), 'warning')
  }
}

// 数据统计相关
// 获取当前年月（格式：YYYY-MM）
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// 选中的月份
const selectedMonth = ref(getCurrentMonth())

// 当前统计数据
const currentStats = ref({
  activities: 0,
  participation: 0,
  rating: '0.0'
})

// 加载统计数据
const loadActivityStats = async (month = null) => {
  try {
    const params = month ? { month } : {}
    const data = await fetchActivityStats(params)
    currentStats.value = {
      activities: data?.activities || 0,
      participation: data?.participation || 0,
      rating: data?.rating || '0.0'
    }
  } catch (e) {
    console.error('加载活动统计失败:', e)
    currentStats.value = {
      activities: 0,
      participation: 0,
      rating: '0.0'
    }
  }
}

// 更新统计数据
const updateStatsData = () => {
  if (selectedMonth.value) {
    loadActivityStats(selectedMonth.value)
    showNotification(`已切换到 ${selectedMonth.value} 的数据`, 'info')
  } else {
    loadActivityStats() // 不传月份参数，获取全部数据
  }
}

// 显示全部数据（统计所有月份的数据）
const showAllData = () => {
  selectedMonth.value = ''
  loadActivityStats() // 不传月份参数，获取全部数据
  showNotification('已显示全部数据统计', 'success')
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
  gap: 16px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f9f9fd;
  border-radius: 10px;
  border: 1px solid #f0f0f5;
  transition: all 0.2s;
}

.config-item:hover {
  background: #fff;
  border-color: #e5e5e5;
}

.config-item label {
  color: #2c2c2c;
  font-weight: 500;
  font-size: 14px;
  min-width: 160px;
}

.config-item input[type="number"] {
  padding: 9px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-width: 140px;
  outline: none;
  transition: all 0.2s;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9fd 100%);
}

.config-item input[type="number"]:focus {
  border-color: #6a5cf8;
  box-shadow: 0 0 0 3px rgba(106, 92, 248, 0.08);
}

.config-item input[type="checkbox"] {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #6a5cf8;
}

/* 保存按钮 */
.btn-save {
  background: linear-gradient(135deg, #6a5cf8 0%, #7c5cf8 100%);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(106, 92, 248, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 92, 248, 0.4);
}

.btn-save:active {
  transform: translateY(0);
}

/* 月份选择器样式 */
.stats-date-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 16px;
  background: #f9f9fd;
  border-radius: 10px;
  border: 1px solid #f0f0f5;
}

.stats-date-picker label {
  color: #2c2c2c;
  font-weight: 500;
  font-size: 14px;
  min-width: 80px;
}

.month-input {
  padding: 9px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9fd 100%);
  color: #2c2c2c;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.month-input:hover {
  border-color: #d0d0d0;
  background-color: #fafafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.month-input:focus {
  border-color: #6a5cf8;
  box-shadow: 0 0 0 3px rgba(106, 92, 248, 0.08);
  background: #fff;
}

/* 导出按钮 */
.btn-export {
  background: linear-gradient(135deg, #6a5cf8 0%, #7c5cf8 100%);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(106, 92, 248, 0.3);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 92, 248, 0.4);
}

.btn-export:active {
  transform: translateY(0);
}

/* 显示全部数据按钮 */
.btn-show-all {
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.3);
  margin-left: 12px;
}

.btn-show-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 71, 161, 0.4);
}

.btn-show-all:active {
  transform: translateY(0);
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

