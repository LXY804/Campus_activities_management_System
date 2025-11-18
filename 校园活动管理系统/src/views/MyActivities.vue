<template>
  <div class="my-activities">
    <h2 class="page-title">我的活动</h2>
    
    <!-- 标签页 -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
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
              <div class="image-placeholder">活动图片</div>
            </div>
            <div class="activity-details">
              <h3 class="activity-name">{{ activity.name }}</h3>
              <div class="activity-meta">
                <span class="meta-item">参与人数: {{ activity.participants }}</span>
                <span class="meta-item">活动状态: {{ activity.status }}</span>
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
            <button 
              v-if="activity.canRegister && activity.status !== '进行中'" 
              class="btn-action btn-register"
              @click="activity.status === '未开始' ? openCancelModal(activity.id) : handleRegister(activity.id)"
            >
              {{ activity.status === '未开始' ? '取消报名' : '点击报名' }}
            </button>
            <button 
              v-else-if="activity.status === '进行中'"
              class="btn-action btn-disabled"
              disabled
            >
              正在进行
            </button>
            <button 
              v-if="activity.canEvaluate" 
              class="btn-action btn-evaluate"
              @click="handleEvaluate(activity.id)"
            >
              点击评价
            </button>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-if="filteredActivities.length === 0" class="empty-state">
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
import { ref, computed } from 'vue'

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'in-progress', label: '进行中' },
  { key: 'not-started', label: '未开始' },
  { key: 'to-evaluate', label: '待评价' },
  { key: 'completed', label: '已结束' }
]

// 模拟活动数据
const activities = ref([
  {
    id: 7717789,
    name: '活动名称活动名称活动名称活动名称活动名称活动名称',
    participants: 7,
    status: '进行中',
    college: '计算机学院',
    keywords: '技术 交流',
    location: '图书馆报告厅',
    time: '12月15日14:00-16:00',
    canRegister: true,
    canEvaluate: false,
    tab: 'in-progress'
  },
  {
    id: 7717790,
    name: '活动名称活动名称活动名称活动名称活动名称活动名称',
    participants: 12,
    status: '待评价',
    college: '机械学院',
    keywords: '实践 创新',
    location: '实验楼201',
    time: '12月20日10:00-12:00',
    canRegister: false,
    canEvaluate: true,
    tab: 'to-evaluate'
  },
  {
    id: 7717791,
    name: '活动名称活动名称活动名称活动名称活动名称活动名称',
    participants: 25,
    status: '未开始',
    college: '管理学院',
    keywords: '讲座 学习',
    location: '教学楼301',
    time: '12月25日15:00-17:00',
    canRegister: true,
    canEvaluate: false,
    tab: 'not-started'
  },
  {
    id: 7717792,
    name: '活动名称活动名称活动名称活动名称活动名称活动名称',
    participants: 18,
    status: '已结束',
    college: '艺术设计学院',
    keywords: '展览 文化',
    location: '艺术馆',
    time: '12月10日09:00-17:00',
    canRegister: false,
    canEvaluate: false,
    tab: 'completed'
  }
])

const filteredActivities = computed(() => {
  if (activeTab.value === 'all') {
    return activities.value
  }
  return activities.value.filter(activity => activity.tab === activeTab.value)
})

const cancelModalVisible = ref(false)
const selectedActivityId = ref(null)

const handleRegister = (id) => {
  alert(`报名活动 ${id}`)
  // 这里可以添加报名逻辑
}

const handleEvaluate = (id) => {
  alert(`评价活动 ${id}`)
  // 这里可以添加评价逻辑
}

const openCancelModal = (id) => {
  selectedActivityId.value = id
  cancelModalVisible.value = true
}

const closeCancelModal = () => {
  cancelModalVisible.value = false
  selectedActivityId.value = null
}

const confirmCancel = () => {
  // TODO: 调用取消报名接口
  cancelModalVisible.value = false
  selectedActivityId.value = null
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
  gap: 8px;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
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
  background: #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-placeholder {
  color: #999;
  font-size: 14px;
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

