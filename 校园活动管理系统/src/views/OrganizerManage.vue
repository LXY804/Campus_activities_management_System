<template>
  <div class="manage-layout page" :style="bgStyle">
    <div class="bg-overlay"></div>
    <div class="nav-bar-wrapper">
      <NavBar />
    </div>
    <div class="layout-content">
      <div class="manage-main">
    <aside class="sidebar">
      <div class="logo">活动管理</div>
      <nav class="menu">
        <a 
          class="menu__item" 
          :class="{ active: currentView === 'publish' }"
          @click="currentView = 'publish'"
        >发布活动</a>
        <a 
          class="menu__item" 
          :class="{ active: currentView === 'review' }"
          @click="currentView = 'review'"
        >审核报名</a>
        <a 
          class="menu__item" 
          :class="{ active: currentView === 'statistics' }"
          @click="currentView = 'statistics'"
        >查看统计</a>
        <a 
          class="menu__item" 
          :class="{ active: currentView === 'checkin' }"
          @click="currentView = 'checkin'"
        >签到管理</a>
      </nav>
    </aside>

    <main class="content">
      <!-- 发布活动视图 -->
      <div v-if="currentView === 'publish'">
        <form class="publish-form" @submit.prevent="handleSubmit">
          <section class="form-section">
            <div class="section-header">
              <h2>基本信息</h2>
              <p>填写活动标题、副标题以及类型，以便学生快速了解活动</p>
            </div>
            <div class="form-grid">
              <div class="form-field span-2">
                <label>活动名称 <span>*</span></label>
                <input v-model="form.title" type="text" placeholder="请输入活动名称" required />
              </div>
              <div class="form-field span-2">
                <label>副标题</label>
                <input v-model="form.subtitle" type="text" placeholder="例如：打造校园创新氛围" />
              </div>
              <div class="form-field span-2">
                <label>活动简介</label>
                <textarea v-model="form.description" rows="3" placeholder="简要介绍活动亮点与目标"></textarea>
              </div>
              <div class="form-field">
                <label>活动类型 <span>*</span></label>
                <select v-model="form.activityType" required>
                  <option disabled value="">请选择类型</option>
                  <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div class="form-field">
                <label>所属学院</label>
                <select v-model="form.belongCollege">
                  <option value="">请选择学院</option>
                  <option v-for="college in collegeOptions" :key="college" :value="college">
                    {{ college }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label>开始时间 <span>*</span></label>
                <input v-model="form.startTime" type="datetime-local" required />
              </div>
              <div class="form-field">
                <label>结束时间 <span>*</span></label>
                <input v-model="form.endTime" type="datetime-local" required />
              </div>
              <div class="form-field">
                <label>活动地点</label>
                <input v-model="form.location" type="text" placeholder="请输入活动举办地点" />
              </div>
              <div class="form-field">
                <label>报名截止时间</label>
                <input v-model="form.registrationDeadline" type="datetime-local" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-header">
              <h2>容量控制</h2>
              <p>设置参与人数以及候补策略，匹配活动场地与秩序</p>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label>人数上限</label>
                <input v-model.number="form.maxParticipants" type="number" min="0" placeholder="0 表示不限制" />
                <small>若不限制人数，可保持为 0</small>
              </div>
              <div class="form-field">
                <label>候补策略</label>
                <div class="toggle-row">
                  <input id="waitlist" type="checkbox" v-model="form.enableWaitlist" />
                  <label for="waitlist">开启候补</label>
                </div>
              </div>
              <div class="form-field" v-if="form.enableWaitlist">
                <label>候补人数上限</label>
                <input v-model.number="form.waitlistLimit" type="number" min="0" placeholder="请输入候补上限" />
              </div>
              <div class="form-field">
                <label>是否需要审核报名</label>
                <div class="toggle-row">
                  <input id="needApproval" type="checkbox" v-model="form.needApproval" />
                  <label for="needApproval">需要审核</label>
                </div>
                <small>开启后，报名需组织者审批后方可参加</small>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-header">
              <h2>报名限制条件</h2>
              <p>控制面向的学院与年级人群，精准推送活动</p>
            </div>
            <div class="form-grid span-2-grid">
              <div class="form-field multi-field">
                <label>面向学院</label>
                <div class="checkbox-group">
                  <label v-for="college in collegeOptions" :key="college">
                    <input type="checkbox" :value="college" v-model="form.targetColleges" />
                    {{ college }}
                  </label>
                </div>
              </div>
              <div class="form-field multi-field">
                <label>面向年级</label>
                <div class="checkbox-group">
                  <label v-for="grade in gradeOptions" :key="grade">
                    <input type="checkbox" :value="grade" v-model="form.targetGrades" />
                    {{ grade }}
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-header">
              <h2>内容与媒体</h2>
              <p>上传封面并完善活动详情，提升吸引力</p>
            </div>
            <div class="form-grid">
              <div class="form-field span-2">
                <label>活动详情</label>
                <textarea v-model="form.detailRichText" rows="6" placeholder="支持图文描述，若需插图可后续接入富文本编辑器"></textarea>
              </div>
              <div class="form-field">
                <label>封面图片</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleCoverUpload" 
                  ref="coverImageInput"
                />
                <div v-if="coverImagePreview" class="cover-preview">
                  <img :src="coverImagePreview" alt="封面预览" />
                  <button type="button" class="remove-cover-btn" @click="removeCoverImage">移除</button>
                </div>
                <small v-if="form.coverImage && !coverImagePreview">已选择：{{ form.coverImage }}</small>
                <small v-else-if="!coverImagePreview" class="upload-hint">请通过文件选择器上传图片（不支持直接输入路径）</small>
              </div>
              <div class="form-field">
                <label>附件上传</label>
                <input type="file" multiple @change="handleAttachmentUpload" />
                <small v-if="form.attachments.length">已上传 {{ form.attachments.length }} 个附件</small>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-header">
              <h2>状态说明</h2>
              <p>活动提交后将进入待审核，审核通过后学生即可报名</p>
            </div>
            <ul class="status-list">
              <li>提交审核：状态变更为「待审核」</li>
              <li>管理员通过后：「已发布」且报名开放</li>
              <li>如需调整：编辑后再次提交审核</li>
            </ul>
          </section>

          <div class="form-actions">
            <button type="button" class="btn secondary" @click="handleSaveDraft">保存草稿</button>
            <button type="submit" class="btn primary">提交审核</button>
          </div>
        </form>
      </div>

      <!-- 审核报名视图 -->
      <div v-if="currentView === 'review'">
        <!-- 活动列表 -->
        <div class="activities-container">
          <div class="activities-list">
            <div v-if="activitiesLoading" class="empty-state">
              <p>加载活动中...</p>
            </div>
            <div v-else-if="activitiesError" class="empty-state">
              <p>{{ activitiesError }}</p>
            </div>
            <template v-else>
              <div 
                v-for="activity in myActivities" 
                :key="activity.id"
                class="activity-card"
              >
                <div class="activity-card__header">
                  <span>活动编号：{{ activity.code || activity.id }}</span>
                  <span class="activity-card__status">{{ getActivityStatusText(activity) }}</span>
                </div>
                <div class="activity-card__body">
                  <div class="activity-card__cover">
                    <img :src="buildImageUrl(activity.coverUrl)" alt="活动封面" />
                    <span class="status-tag">{{ formatStatus(activity.status || 'open') }}</span>
                  </div>
                  <div class="activity-card__info">
                    <h3>{{ activity.title || '未命名活动' }}</h3>
                    <p class="activity-card__meta">
                      <span>学院：{{ activity.belongCollege || '未设置' }}</span>
                      <span>地点：{{ activity.location || '未设置' }}</span>
                      <span>时间：{{ formatDateRange(activity.startTime, activity.endTime) }}</span>
                    </p>
                    <div class="activity-card__stats">
                      <span>总报名：{{ activity.totalApplications }}</span>
                      <span>待审核：{{ activity.pendingApplications }}</span>
                      <span>已通过：{{ activity.approvedApplications }}</span>
                    </div>
                  </div>
                  <div class="activity-card__action">
                    <button class="btn-detail" @click="openReviewPanel(activity)">报名详情</button>
                  </div>
                </div>
              </div>

              <div v-if="myActivities.length === 0" class="empty-state">
                <p>📭 暂无发布的活动</p>
                <p class="empty-state__hint">先去发布一个活动吧！</p>
              </div>
            </template>
          </div>
        </div>

        <!-- 报名详情抽屉 -->
        <div 
          v-if="selectedActivity" 
          class="review-panel"
          @click.self="closeReviewPanel"
        >
          <div class="review-panel__content">
            <div class="review-panel__header">
              <h2>{{ selectedActivity.title }} - 报名列表</h2>
              <button class="btn-close" @click="closeReviewPanel">×</button>
            </div>
            
            <div class="applications-list">
              <div v-if="applicationsLoading" class="empty-applications">
                <p>报名数据加载中...</p>
              </div>
              <div v-else-if="applicationsError" class="empty-applications">
                <p>{{ applicationsError }}</p>
              </div>
              <template v-else>
                <div 
                  v-for="app in currentApplications" 
                  :key="app.id"
                  class="application-item"
                >
                  <div class="application-item__info">
                    <div class="application-item__name">{{ app.userName }}</div>
                    <div class="application-item__meta">
                      报名时间：{{ formatDateTime(app.applyTime) }}
                    </div>
                  </div>
                  <div class="application-item__status">
                    <span 
                      class="status-badge"
                      :class="app.status"
                    >
                      {{ getStatusText(app.status) }}
                    </span>
                  </div>
                  <div class="application-item__actions">
                    <button 
                      v-if="app.status === 'pending'"
                      class="btn-approve"
                      :disabled="isUpdating(app.id)"
                      @click="handleApprove(app)"
                    >
                      {{ isUpdating(app.id) ? '处理中...' : '通过' }}
                    </button>
                    <button 
                      v-if="app.status === 'pending'"
                      class="btn-reject"
                      :disabled="isUpdating(app.id)"
                      @click="handleReject(app)"
                    >
                      {{ isUpdating(app.id) ? '处理中...' : '拒绝' }}
                    </button>
                  </div>
                </div>

                <div v-if="currentApplications.length === 0" class="empty-applications">
                  <p>📭 暂无报名记录</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看统计视图 -->
      <div v-if="currentView === 'statistics'">
        <div class="empty-state">
          <p>功能开发中...</p>
        </div>
      </div>

      <!-- 签到管理视图 -->
      <div v-if="currentView === 'checkin'">
        <div class="empty-state">
          <p>功能开发中...</p>
        </div>
      </div>
    </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import libraryImg from '@/assets/图书馆.webp'
import { createEvent } from '@/api/event'
import {
  fetchMyActivities as fetchOrganizerActivities,
  fetchActivityApplications,
  updateApplicationStatus
} from '@/api/organizer'

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const DEFAULT_COVER = `${API_ORIGIN}/uploads/3b72bdb5a6ca17d85131e816c9fdd0b1.jpg`

const buildImageUrl = (coverUrl) => {
  if (!coverUrl || coverUrl === '' || coverUrl === 'null' || coverUrl === 'undefined') {
    return DEFAULT_COVER
  }
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
    return coverUrl
  }
  let normalized = coverUrl.replace(/\\/g, '/')
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
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
const currentView = ref('publish')
const selectedActivity = ref(null)
const currentApplications = ref([])

const activityTypes = ['学术讲座', '文体活动', '志愿服务', '竞赛比赛', '社团活动']
const collegeOptions = ['计算机学院', '软件学院', '管理学院', '艺术设计学院', '经济学院']
const gradeOptions = ['大一', '大二', '大三', '大四', '研究生']

const getDefaultForm = () => ({
  title: '',
  subtitle: '',
  activityType: '',
  belongCollege: '',
  description: '',
  detailRichText: '',
  location: '',
  startTime: '',
  endTime: '',
  registrationDeadline: '',
  maxParticipants: 0,
  enableWaitlist: false,
  waitlistLimit: 0,
  needApproval: false,
  targetColleges: [],
  targetGrades: [],
  coverImage: '',
  attachments: []
})

// 表单数据
const form = reactive(getDefaultForm())

// 我的活动列表
const myActivities = ref([])
const activitiesLoading = ref(false)
const activitiesError = ref('')
const applicationsLoading = ref(false)
const applicationsError = ref('')
const updatingApplicationId = ref(null)

// 封面图片相关
const coverImageFile = ref(null)
const coverImagePreview = ref(null)
const coverImageInput = ref(null)

const DRAFT_KEY = 'organizer_publish_draft'

// 初始化数据
onMounted(() => {
  loadActivities()
  restoreDraft()
})

const mapActivity = (item) => ({
  id: item.id,
  code: item.code,
  title: item.title || '未命名活动',
  location: item.location || '',
  startTime: item.start_time,
  endTime: item.end_time,
  capacity: item.capacity || 0,
  belongCollege: item.target_college_name || '',
  coverUrl: item.cover_url || '',
  workflowStatus: item.workflow_status || 'published',
  status: item.status || 'open',
  totalApplications: Number(item.total_applications) || 0,
  pendingApplications: Number(item.pending_applications) || 0,
  approvedApplications: Number(item.approved_applications) || 0
})

// 加载活动列表
const loadActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = ''
  try {
    const list = await fetchOrganizerActivities()
    myActivities.value = Array.isArray(list) ? list.map(mapActivity) : []
  } catch (err) {
    activitiesError.value = err?.message || '加载活动失败'
    myActivities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

// 提交活动表单
const handleSubmit = async () => {
  // 验证必填字段
  if (!form.title || !form.activityType || !form.startTime || !form.endTime) {
    window.alert('请填写必填字段')
    return
  }

  try {
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description || form.detailRichText || '')
    formData.append('activityType', form.activityType)
    formData.append('belongCollege', form.belongCollege || '')
    formData.append('location', form.location || '')
    formData.append('startTime', form.startTime)
    formData.append('endTime', form.endTime)
    formData.append('maxParticipants', form.maxParticipants || 0)

    if (coverImageFile.value) {
      formData.append('coverImage', coverImageFile.value)
    }

    await createEvent(formData)
    window.alert('活动已提交，请等待管理员审核')
    await loadActivities()
    currentView.value = 'review'
    resetForm()
    clearDraft()
  } catch (err) {
    window.alert(err?.message || '提交失败，请重试')
  }
}

const handleSaveDraft = () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
  window.alert('已保存草稿')
}

const resetForm = () => {
  // 释放预览URL
  if (coverImagePreview.value) {
    URL.revokeObjectURL(coverImagePreview.value)
  }
  coverImagePreview.value = null
  coverImageFile.value = null
  if (coverImageInput.value) {
    coverImageInput.value.value = ''
  }
  Object.assign(form, getDefaultForm())
}

const restoreDraft = () => {
  const stored = localStorage.getItem(DRAFT_KEY)
  if (stored) {
    Object.assign(form, getDefaultForm(), JSON.parse(stored))
  }
}

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY)
}

const handleCoverUpload = (event) => {
  const file = event.target.files && event.target.files[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      window.alert('请选择图片文件')
      event.target.value = '' // 清空选择
      return
    }
    
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      window.alert('图片大小不能超过 5MB')
      event.target.value = '' // 清空选择
      return
    }
    
    form.coverImage = file.name
    coverImageFile.value = file
    
    // 创建预览URL
    if (coverImagePreview.value) {
      URL.revokeObjectURL(coverImagePreview.value)
    }
    coverImagePreview.value = URL.createObjectURL(file)
  }
}

const removeCoverImage = () => {
  // 释放预览URL
  if (coverImagePreview.value) {
    URL.revokeObjectURL(coverImagePreview.value)
  }
  coverImagePreview.value = null
  coverImageFile.value = null
  form.coverImage = ''
  if (coverImageInput.value) {
    coverImageInput.value.value = ''
  }
}

const handleAttachmentUpload = (event) => {
  const files = Array.from(event.target.files || [])
  form.attachments = files.map(file => file.name)
}

const loadApplications = async (activityId) => {
  if (!activityId) return
  applicationsLoading.value = true
  applicationsError.value = ''
  currentApplications.value = []
  try {
    const list = await fetchActivityApplications(activityId)
    currentApplications.value = Array.isArray(list)
      ? list.map((item) => ({
          id: item.id,
          userId: item.user_id,
          userName: item.user_name || '未命名',
          applyTime: item.apply_time,
          status: item.status || 'pending'
        }))
      : []
  } catch (err) {
    applicationsError.value = err?.message || '加载报名数据失败'
    currentApplications.value = []
  } finally {
    applicationsLoading.value = false
  }
}

const openReviewPanel = async (activity) => {
  selectedActivity.value = activity
  await loadApplications(activity.id)
}

const closeReviewPanel = () => {
  selectedActivity.value = null
  currentApplications.value = []
  applicationsError.value = ''
}

const refreshApplications = async () => {
  if (selectedActivity.value) {
    await loadApplications(selectedActivity.value.id)
  }
}

const handleApprove = async (app) => {
  if (app.status !== 'pending') return
  updatingApplicationId.value = app.id
  try {
    await updateApplicationStatus(app.id, 'approved')
    app.status = 'approved'
    await loadActivities()
    window.alert('已通过该报名申请')
  } catch (err) {
    window.alert(err?.message || '操作失败')
  } finally {
    updatingApplicationId.value = null
    await refreshApplications()
  }
}

const handleReject = async (app) => {
  if (app.status !== 'pending') return
  if (!window.confirm('确定要拒绝该报名申请吗？')) {
    return
  }
  updatingApplicationId.value = app.id
  try {
    await updateApplicationStatus(app.id, 'rejected')
    app.status = 'rejected'
    await loadActivities()
    window.alert('已拒绝该报名申请')
  } catch (err) {
    window.alert(err?.message || '操作失败')
  } finally {
    updatingApplicationId.value = null
    await refreshApplications()
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 状态文本
const getStatusText = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const formatDateRange = (start, end) => {
  if (!start && !end) return '未设置'
  const fmt = dateStr => new Date(dateStr).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
  return `${start ? fmt(start) : '未设置'} - ${end ? fmt(end) : '未设置'}`
}

const formatStatus = (status) => {
  const map = {
    pending_review: '待审核',
    draft: '草稿',
    rejected: '已驳回',
    published: '已发布',
    open: '进行中',
    ongoing: '进行中',
    upcoming: '未开始',
    ended: '已结束',
    finished: '已结束'
  }
  return map[status] || '未知状态'
}

const getActivityStatusText = (activity) => {
  if (activity.workflowStatus === 'pending_review' || activity.workflowStatus === 'draft' || activity.workflowStatus === 'rejected') {
    return formatStatus(activity.workflowStatus)
  }
  return formatStatus(activity.status || 'open')
}

const isUpdating = (id) => updatingApplicationId.value === id
</script>

<style scoped>
.manage-layout.page{
  position:relative;
  min-height:100vh;
  color:#2c2c2c;
  overflow:auto;
}
.manage-layout .layout-content{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  width:100%;
  min-height:100vh;
  gap:16px;
  padding-top:0;
  padding-bottom:40px;
}
.nav-bar-wrapper{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  z-index:20;
  background:rgba(255,255,255,0.95);
  box-shadow:0 2px 10px rgba(0,0,0,0.08);
  backdrop-filter:blur(6px);
}
.manage-main{
  display:flex;
  width:100%;
  margin-top:51px;
}
.bg-overlay{
  position:absolute;
  inset:0;
  background:rgba(255,255,255,0.6);
  backdrop-filter:blur(2px);
  pointer-events:none;
}
.sidebar{
  width:200px;
  background:rgba(255,255,255,0.78);
  backdrop-filter:blur(12px);
  padding:26px 22px;
  box-shadow:0 25px 40px rgba(15,35,95,0.18);
  border:1px solid rgba(255,255,255,0.35);
  border-radius:28px;
  position:fixed;
  top:80px;
  left:24px;
  height:calc(100vh - 140px);
  overflow-y:auto;
}
.logo{
  font-weight:700;
  font-size:25px;
  color:#0a0a1c;
  margin-bottom:30px;
}
.menu{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.menu__item{
  padding:14px 18px;
  border-radius:18px;
  font-size:18px;
  color:#1f2a37;
  text-decoration:none;
  cursor:pointer;
  transition:all .2s;
  font-weight:600;
}
.menu__item.active,
.menu__item:hover{
  background:linear-gradient(135deg,#1f5fd1,#1347a8);
  color:#fff;
  box-shadow:0 10px 20px rgba(31,95,209,0.35);
}
.content{
  flex:1;
  padding:32px;
  margin-left:248px;
}
.page-header{
  margin-bottom:24px;
}
.page-header__icon{
  font-size:26px;
  margin-bottom:8px;
}
.page-header h1{
  font-size:24px;
  margin-bottom:6px;
}
.page-header__desc{
  color:#777777;
  font-size:14px;
}
.publish-form{
  background:#fff;
  border-radius:20px;
  padding:32px;
  box-shadow:0 10px 30px rgba(0,0,0,.05);
  display:flex;
  flex-direction:column;
  gap:22px;
  max-width:1100px;
  margin:0 auto;
}
.form-section{
  border:1px solid #f0f0f5;
  border-radius:18px;
  padding:24px;
  background:#ffffff;
  display:flex;
  flex-direction:column;
  gap:18px;
}
.section-header h2{
  font-size:18px;
  margin-bottom:6px;
  color:#161832;
}
.section-header p{
  color:#7b7d91;
  font-size:14px;
}
.form-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:20px 24px;
}
.form-grid.span-2-grid{
  grid-template-columns:repeat(2,minmax(0,1fr));
}
.form-field.span-2{
  grid-column:span 2;
}
.form-field{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.multi-field{
  background:#fff;
  padding:16px;
  border-radius:12px;
  border:1px dashed #dfe3f1;
}
.checkbox-group{
  display:flex;
  flex-wrap:wrap;
  gap:12px 24px;
  font-size:14px;
}
.checkbox-group label{
  display:flex;
  align-items:center;
  gap:6px;
  color:#4b4f68;
}
.form-row{
  display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
  gap:20px;
}
.form-field label{
  font-weight:600;
  color:#333;
  display:flex;
  align-items:center;
  gap:4px;
}
.form-field label span{
  color:#f03d3d;
}
.form-field input,
.form-field textarea,
.form-field select{
  border:1px solid #e0e0e0;
  border-radius:10px;
  padding:12px 14px;
  font-size:15px;
  transition:border .2s, box-shadow .2s;
}
.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus{
  outline:none;
  border-color:#22a46d;
  box-shadow:0 0 0 3px rgba(34,164,109,.15);
}
.form-field small{
  color:#888;
  font-size:13px;
}
.toggle-row{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:600;
  color:#2f3152;
}
.toggle-row input[type="checkbox"]{
  width:18px;
  height:18px;
}
.form-actions{
  display:flex;
  justify-content:flex-end;
  gap:16px;
  margin-top:12px;
}
.btn{
  border:none;
  border-radius:12px;
  padding:12px 28px;
  font-size:15px;
  font-weight:600;
  cursor:pointer;
  transition:transform .2s, box-shadow .2s;
}
.btn.primary{
  background:#1c9b60;
  color:#fff;
  box-shadow:0 10px 20px rgba(28,155,96,.25);
}
.btn.primary:hover{
  transform:translateY(-1px);
}
.btn.secondary{
  background:#fff;
  border:1px solid #dcdcdc;
  color:#333;
}
.btn.secondary:hover{
  background:#f5f5f5;
}

/* 活动列表样式 */
.activities-container{
  max-width:1100px;
  margin:0 auto;
  background:rgba(255,255,255,0.9);
  border-radius:12px;
  padding:20px 18px 30px;
  box-shadow:0 15px 35px rgba(0,0,0,0.08);
}
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding:0;
}

.activity-card {
  border:1px solid #dbe4f5;
  border-radius:12px;
  background:#f6fbff;
  width:100%;
}

.activity-card__header{
  background:#e8f3ff;
  padding:12px 18px;
  border-top-left-radius:12px;
  border-top-right-radius:12px;
  display:flex;
  justify-content:space-between;
  font-weight:600;
  color:#1c3a63;
}

.activity-card__body{
  display:flex;
  gap:18px;
  padding:18px 18px 20px;
  align-items:center;
  background:rgba(255,255,255,0.9);
  border-bottom-left-radius:12px;
  border-bottom-right-radius:12px;
}

.activity-card__cover{
  width:160px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.activity-card__cover img{
  width:140px;
  height:100px;
  object-fit:cover;
  border-radius:6px;
  background:#a8bed8;
}

.activity-card__info {
  flex: 1;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.activity-card__info h3{
  margin:0;
  font-size:18px;
}

.activity-card__meta{
  display:flex;
  gap:18px;
  color:#444;
  font-size:14px;
  flex-wrap:wrap;
}

.activity-card__stats{
  display:flex;
  gap:24px;
  color:#555;
}

.activity-card__action{
  width:140px;
  display:flex;
  justify-content:flex-end;
}

.btn-detail{
  background:#66bb33;
  color:#fff;
  border:0;
  border-radius:8px;
  padding:10px 18px;
  font-weight:700;
  cursor:pointer;
}

/* 审核面板样式 */
.review-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.review-panel__content {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.review-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.review-panel__header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #f5f5f5;
}

.applications-list {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.application-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.application-item:hover {
  border-color: #764ba2;
}

.application-item__info {
  flex: 1;
}

.application-item__name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 15px;
}

.application-item__meta {
  font-size: 13px;
  color: #999;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.approved {
  background: #d1fae5;
  color: #059669;
}

.status-badge.rejected {
  background: #f8f8f8;
  color: #dc2626;
}

.application-item__actions {
  display: flex;
  gap: 8px;
}

.btn-approve,
.btn-reject {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-approve:hover,
.btn-reject:hover {
  opacity: 0.9;
}

.btn-approve {
  background: #10b981;
  color: #fff;
}

.btn-reject {
  background: #ef4444;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.empty-state p {
  font-size: 16px;
  margin: 8px 0;
}

.empty-state__hint {
  font-size: 14px;
  color: #bbb;
}

.empty-applications {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
.status-list{
  list-style:disc;
  padding-left:22px;
  color:#555;
  line-height:1.6;
}

.upload-hint {
  color: #999;
  font-style: italic;
}

.cover-preview {
  margin-top: 12px;
  position: relative;
  display: inline-block;
}

.cover-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #ddd;
  object-fit: cover;
}

.remove-cover-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-cover-btn:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .manage-main{
    flex-direction:column;
  }
  .sidebar{
    position:static;
    width:100%;
    height:auto;
  }
  .content{
    margin-left:0;
  }
  .form-grid,
  .form-grid.span-2-grid{
    grid-template-columns:1fr;
  }
  .form-grid{
    grid-template-columns:1fr;
  }
  .form-field.span-2{
    grid-column:span 1;
  }
  .activity-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .btn-detail {
    width: 100%;
  }
  
  .application-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .application-item__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
