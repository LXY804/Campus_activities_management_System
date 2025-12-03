<template>
  <div class="page event-comments">
    <NavBar />

    <div class="container">
      <button class="back" @click="goBack">← 返回</button>

      <div class="header">
        <h1 class="title">{{ eventTitle || '活动评论' }}</h1>
        <p class="subtitle" v-if="eventTitle">查看所有用户对该活动的评价</p>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-else>
        <div class="stats" v-if="commentsData.total > 0">
          <span>共 {{ commentsData.total }} 条评论</span>
        </div>

        <div v-if="comments.length === 0" class="empty-state">
          <p>暂无评论</p>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-header">
              <div class="user-info">
                <span class="username">{{ comment.username || '匿名用户' }}</span>
                <span class="rating">
                  <span class="stars">{{ '★'.repeat(comment.rating) }}{{ '☆'.repeat(5 - comment.rating) }}</span>
                  <span class="rating-num">{{ comment.rating }}分</span>
                </span>
              </div>
              <span class="date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="commentsData.total > commentsData.pageSize" class="pagination">
          <button 
            @click="loadComments(commentsData.page - 1)" 
            :disabled="commentsData.page <= 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ commentsData.page }} / {{ Math.ceil(commentsData.total / commentsData.pageSize) }} 页
          </span>
          <button 
            @click="loadComments(commentsData.page + 1)" 
            :disabled="commentsData.page >= Math.ceil(commentsData.total / commentsData.pageSize)"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { fetchEventComments } from '@/api/comment'
import { fetchEventDetail } from '@/api/event'

const router = useRouter()
const route = useRoute()
const eventId = route.params.id

const eventTitle = ref('')
const comments = ref([])
const commentsData = ref({
  list: [],
  total: 0,
  page: 1,
  pageSize: 10
})
const loading = ref(false)
const errorMsg = ref('')

function goBack() {
  router.back()
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const loadEventInfo = async () => {
  try {
    const data = await fetchEventDetail(eventId)
    eventTitle.value = data.title || ''
  } catch (err) {
    console.error('加载活动信息失败:', err)
  }
}

const loadComments = async (page = 1) => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchEventComments(eventId, { page, pageSize: commentsData.value.pageSize })
    comments.value = data?.list || []
    commentsData.value = {
      list: data?.list || [],
      total: data?.total || 0,
      page: data?.page || 1,
      pageSize: data?.pageSize || 10
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || '加载评论失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEventInfo()
  loadComments()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
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
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.stats {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

.comment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #ff9800;
  font-size: 16px;
}

.rating-num {
  color: #666;
  font-size: 14px;
}

.date {
  color: #999;
  font-size: 14px;
}

.comment-content {
  color: #444;
  line-height: 1.6;
  margin: 0;
  font-size: 15px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px 0;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #0066cc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .date {
    align-self: flex-end;
  }
}
</style>







