<template>
  <div class="my-activities">
    <h2 class="page-title">我的活动</h2>
    
    <!-- 标签页 -->
    <div class="tabs">
      <div class="tabs-left">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
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

    <!-- 活动列表（可滚动区域） -->
    <div class="activities-scroll">
      <div class="activities-list">
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="activity-card"
        >
          <div class="activity-info">
            <div class="activity-id">活动编号: {{ activity.id }}</div>
            <div class="activity-image">
              <img :src="buildImageUrl(activity.image)" alt="活动图片" @error="handleImageError($event)" />
            </div>
            <div class="activity-details">
              <h3 class="activity-name">{{ activity.name }}</h3>
              <div class="activity-meta">
                <span class="meta-item">参与人数: {{ activity.participants }}</span>
                <span class="meta-item">活动状态: {{ activity.status }}</span>
                <span class="meta-item">
                  报名状态: {{ registrationStatusLabelMap[activity.registrationStatus] || '未知' }}
                </span>
              </div>
              <div class="activity-info-text">
                <span>学院: {{ activity.college }}</span>
                <span>关键词: {{ activity.keywords }}</span>
                <span>地点: {{ activity.location }}</span>
                <span>时间: {{ activity.time }}</span>
              </div>
            </div>
          </div>
          <div class="activity-actions">
            <!-- 只有活动未结束时才显示取消报名按钮 -->
            <button
              v-if="['pending','approved'].includes(activity.registrationStatus) && !['ended', 'finished'].includes(activity.eventStatus)"
              class="btn-action btn-register"
              @click="openCancelModal(activity.id)"
            >
              {{ activity.registrationStatus === 'pending' ? '撤回申请' : '取消报名' }}
            </button>
            <button
              v-else-if="!['ended', 'finished'].includes(activity.eventStatus)"
              class="btn-action btn-disabled"
              disabled
            >
              {{ activity.registrationStatus === 'cancelled' ? '已取消' : '不可操作' }}
            </button>
            <button 
              v-if="activity.canEvaluate" 
              class="btn-action btn-evaluate"
              @click="handleEvaluate(activity.eventId)"
            >
              去评价
            </button>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-if="loading" class="empty-state">努力加载中...</div>
      <div v-else-if="errorMsg" class="empty-state">{{ errorMsg }}</div>
      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <p>暂无活动数据</p>
      </div>
    </div>

    <!-- 取消报名弹窗 -->
    <div v-if="cancelModalVisible" class="modal-mask">
      <div class="modal-container">
        <h3>提示</h3>
        <p>您是否要取消活动，无故取消活动超过3次的同学在本学期将不能继续报名任何活动。</p>
        <div class="modal-actions">
          <button class="btn-action btn-cancel" @click="closeCancelModal">取消</button>
          <button class="btn-action btn-confirm" @click="confirmCancel">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyRegistrations, cancelRegistration } from '@/api/registration'
import { fetchActivityTypes } from '@/api/event'
const router = useRouter()
const activeTab = ref('all')

// 后端基础地址，用于拼接封面图片等静态资源完整 URL
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const DEFAULT_COVER = `${API_ORIGIN}/uploads/3b72bdb5a6ca17d85131e816c9fdd0b1.jpg`

// 构建图片URL
const buildImageUrl = (coverUrl) => {
  if (!coverUrl || coverUrl === '' || coverUrl === 'null' || coverUrl === 'undefined') {
    return DEFAULT_COVER
  }
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

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'in-progress', label: '进行中' },
  { key: 'not-started', label: '未开始' },
  { key: 'to-evaluate', label: '待评价' },
  { key: 'completed', label: '已结束' }
]

const activities = ref([])
const loading = ref(false)
const errorMsg = ref('')
const activityTypes = ref([])
const selectedTypeId = ref('')

// 报名状态文案映射：pending/approved/rejected/cancelled -> 待审核/已通过/已拒绝/已取消
const registrationStatusLabelMap = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消'
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

const statusToTab = (eventStatus, registrationStatus, hasComment) => {
  // 报名还在待审核：只放在“全部”里，不进其他分类
  if (registrationStatus === 'pending') return 'all'

  if (['open', 'ongoing'].includes(eventStatus)) return 'in-progress'
  if (['upcoming'].includes(eventStatus)) return 'not-started'
  if (
    ['finished', 'ended'].includes(eventStatus) &&
    ['approved', 'checked_in'].includes(registrationStatus)
  ) {
    // 已结束且已通过：如果还没评论 -> 待评价；如果已评论 -> 已结束
    return hasComment ? 'completed' : 'to-evaluate'
  }
  if (['finished', 'ended', 'cancelled'].includes(eventStatus)) return 'completed'
  return 'all'
}

const statusLabelMap = {
  open: '进行中',
  ongoing: '进行中',
  upcoming: '未开始',
  finished: '已结束',
  ended: '已结束',
  cancelled: '已取消'
}

const loadActivities = async () => {
  if (!requireLogin()) return
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchMyRegistrations()
    activities.value =
      data?.list?.map((item) => ({
        id: item.registration_id,
        eventId: item.event_id,
        name: item.event_title,
        image: item.cover_url || '', // 添加图片URL
        participants: item.capacity || 0,
        status: statusLabelMap[item.event_status] || '进行中',
        eventStatus: item.event_status, // 保存原始状态用于判断
        registrationStatus: item.registration_status,
        college: item.organizer_name || '',
        keywords: '',
        location: item.location,
        time: item.start_time ? new Date(item.start_time).toLocaleString() : '',
        type_id: item.type_id, // 保存活动类型ID用于筛选
        canRegister: ['pending'].includes(item.registration_status),
        // 只有结束且通过且尚未评论的活动才可评价
        canEvaluate:
          ['finished', 'ended'].includes(item.event_status) &&
          ['approved', 'checked_in'].includes(item.registration_status) &&
          !item.has_comment,
        tab: statusToTab(item.event_status, item.registration_status, item.has_comment)
      })) || []
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || '加载报名列表失败'
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
  // 类型筛选在前端 computed 中处理，这里不需要重新加载数据
}

onMounted(() => {
  loadActivityTypes()
  loadActivities()
})

const filteredActivities = computed(() => {
  let result = activities.value
  
  // 按状态标签筛选
  if (activeTab.value !== 'all') {
    result = result.filter((activity) => activity.tab === activeTab.value)
  }
  
  // 按活动类型筛选
  if (selectedTypeId.value) {
    result = result.filter((activity) => activity.type_id === parseInt(selectedTypeId.value))
  }
  
  return result
})

const cancelModalVisible = ref(false)
const selectedActivityId = ref(null)

const openCancelModal = (id) => {
  selectedActivityId.value = id
  cancelModalVisible.value = true
}

const closeCancelModal = () => {
  cancelModalVisible.value = false
  selectedActivityId.value = null
}

const confirmCancel = async () => {
  if (!selectedActivityId.value) return
  try {
    await cancelRegistration(selectedActivityId.value)
    alert('已取消报名')
    await loadActivities()
  } catch (err) {
    alert(err?.message || '取消失败')
  } finally {
    closeCancelModal()
  }
}

const handleEvaluate = (eventId) => {
  router.push({ name: 'EventEvaluate', params: { id: eventId } })
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认图片
  if (event.target.src !== DEFAULT_COVER) {
    event.target.src = DEFAULT_COVER
  }
}
</script>

<style scoped>
.my-activities {
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabs-left {
  display: flex;
  gap: 8px;
  flex: 1;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  min-width: 150px;
  transition: border-color 0.2s;
}

.type-select:focus {
  outline: none;
  border-color: #1565c0;
}

.tab {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: #1565c0;
}

.tab.active {
  color: #1565c0;
  border-bottom-color: #1565c0;
  font-weight: 600;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: box-shadow 0.2s;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activities-scroll {
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  padding-right: 12px;
}

.activities-scroll::-webkit-scrollbar {
  width: 6px;
}

.activities-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.activities-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-id {
  font-size: 14px;
  color: #999;
}

.activity-image {
  width: 200px;
  height: 120px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #e0e0e0;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.activity-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  padding-right: 16px;
  border-right: 1px solid #ddd;
}

.meta-item:last-child {
  border-right: none;
}

.activity-info-text {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.activity-info-text span {
  padding-right: 12px;
  border-right: 1px solid #ddd;
}

.activity-info-text span:last-child {
  border-right: none;
}

.activity-actions {
  display: flex;
  align-items: flex-start;
  padding-top: 40px;
}

.btn-action {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-register {
  background: #4caf50;
  color: white;
}

.btn-register:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-evaluate {
  background: #ff9800;
  color: white;
}

.btn-evaluate:hover {
  background: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

.btn-disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.modal-container h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #333;
}

.modal-container p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
  box-shadow: none;
  transform: none;
}

.btn-confirm {
  background: #d32f2f;
  color: #fff;
}

.btn-confirm:hover {
  background: #b71c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

@media (max-width: 768px) {
  .activity-card {
    flex-direction: column;
  }

  .activity-image {
    width: 100%;
    height: 180px;
  }
  
  .activity-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .activity-actions {
    padding-top: 16px;
  }

  .tabs {
    overflow-x: auto;
  }

  .tab {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>

