<template>
  <div class="page event-evaluate">
    <NavBar />

    <div class="container">
      <button class="back" @click="goBack">← 返回</button>

      <div class="header">
        <h1 class="title">活动评价</h1>
        <p class="subtitle" v-if="eventTitle">{{ eventTitle }}</p>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-else class="evaluate-form">
        <div class="form-section">
          <label class="form-label">评分 <span class="required">*</span></label>
          <div class="rating-selector">
            <button
              v-for="star in 5"
              :key="star"
              :class="['star-btn', { active: rating >= star }]"
              @click="rating = star"
            >
              ★
            </button>
            <span class="rating-text">{{ rating > 0 ? `${rating}分` : '请选择评分' }}</span>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">评价内容 <span class="required">*</span></label>
          <textarea
            v-model="content"
            class="content-input"
            placeholder="请输入您的评价内容..."
            rows="8"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ content.length }}/500</div>
        </div>

        <div class="form-actions">
          <button class="btn btn-cancel" @click="goBack">取消</button>
          <button 
            class="btn btn-submit" 
            :disabled="!canSubmit || submitting"
            @click="handleSubmit"
          >
            {{ submitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { fetchEventDetail } from '@/api/event'
import { submitComment } from '@/api/comment'

const router = useRouter()
const route = useRoute()
const eventId = route.params.id

const eventTitle = ref('')
const rating = ref(0)
const content = ref('')
const loading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => {
  return rating.value >= 1 && rating.value <= 5 && content.value.trim().length > 0
})

function goBack() {
  router.back()
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

const loadEventInfo = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchEventDetail(eventId)
    eventTitle.value = data.title || ''
  } catch (err) {
    console.error('加载活动信息失败:', err)
    errorMsg.value = err?.message || '加载活动信息失败'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!requireLogin()) return
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await submitComment(eventId, {
      rating: rating.value,
      content: content.value.trim()
    })
    alert('评价提交成功！')
    // 返回上一页或跳转到我的评论页面
    router.push('/personal/comments')
  } catch (err) {
    console.error(err)
    const msg = err?.response?.data?.message || err?.message || '提交评价失败'
    alert(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadEventInfo()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 18px;
}

.back {
  background: transparent;
  border: 0;
  color: #0066cc;
  cursor: pointer;
  margin-bottom: 12px;
  font-size: 14px;
}

.back:hover {
  text-decoration: underline;
}

.header {
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.loading,
.error {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.evaluate-form {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.required {
  color: #f44336;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 36px;
  color: #ddd;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: all 0.2s;
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn.active {
  color: #ff9800;
}

.rating-text {
  font-size: 16px;
  color: #666;
  margin-left: 8px;
}

.content-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
}

.content-input:focus {
  outline: none;
  border-color: #0066cc;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #0066cc;
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 102, 204, 0.3);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .evaluate-form {
    padding: 24px;
  }

  .star-btn {
    font-size: 32px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>





