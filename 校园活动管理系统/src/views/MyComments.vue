<template>
  <div class="my-comments">
    <h2 class="page-title">我的评论</h2>

    <div v-if="loading" class="empty-state">
      正在加载评论...
    </div>

    <div v-else-if="errorMsg" class="empty-state">
      {{ errorMsg }}
    </div>

    <div v-else-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-card">
        <div class="comment-header">
          <div>
            <div class="comment-activity">{{ comment.activityName }}</div>
            <div class="comment-meta">
              <span>活动时间：{{ comment.time }}</span>
              <span>地点：{{ comment.location }}</span>
            </div>
          </div>
          <span class="comment-score">{{ comment.score }}分</span>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <div class="comment-footer">
          <span>评论时间：{{ comment.date }}</span>
          <span>状态：{{ comment.status }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>暂无评论数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMyComments } from '@/api/comment'
import { useRouter } from 'vue-router'

const router = useRouter()
const comments = ref([])
const loading = ref(false)
const errorMsg = ref('')

const requireLogin = () => {
  if (!localStorage.getItem('token')) {
    if (confirm('此操作需要登录，是否前往登录？')) {
      router.push('/login')
    }
    return false
  }
  return true
}

const loadComments = async () => {
  if (!requireLogin()) return
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchMyComments()
    comments.value =
      data?.list?.map((item) => ({
        id: item.id,
        activityName: item.event_title,
        time: item.start_time ? new Date(item.start_time).toLocaleString() : '',
        location: item.location || '',
        score: item.rating,
        content: item.content,
        date: item.created_at ? new Date(item.created_at).toLocaleString() : '',
        status: item.status === 1 ? '已通过' : item.status === 0 ? '审核中' : '已隐藏'
      })) || []
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || '加载评论失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadComments)
</script>

<style scoped>
.my-comments {
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 8px;
}

.comment-list::-webkit-scrollbar{
  width:6px;
}
.comment-list::-webkit-scrollbar-thumb{
  background:rgba(21,101,192,0.4);
  border-radius:999px;
}

.comment-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #eee;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-activity {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.comment-meta {
  font-size: 14px;
  color: #666;
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.comment-score {
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

.comment-content {
  font-size: 15px;
  color: #444;
  line-height: 1.6;
  margin: 0 0 12px;
}

.comment-footer {
  font-size: 13px;
  color: #999;
  display: flex;
  justify-content: space-between;
}
</style>

