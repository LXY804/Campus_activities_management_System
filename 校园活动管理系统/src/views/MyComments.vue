<template>
  <div class="my-comments">
    <h2 class="page-title">我的评论</h2>

    <div v-if="comments.length" class="comment-list">
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
import { ref } from 'vue'

const comments = ref([
  {
    id: 1,
    activityName: 'AI 技术交流沙龙',
    time: '12月18日 14:00-16:00',
    location: '图书馆报告厅',
    score: 5,
    content: '讲座内容非常充实，分享的案例很实用，收获很多。',
    date: '2025-12-20 10:15',
    status: '已通过'
  },
  {
    id: 2,
    activityName: '校园公益志愿活动',
    time: '12月10日 09:00-12:00',
    location: '南门广场',
    score: 4,
    content: '组织得井井有条，希望下次时间可以再灵活一些。',
    date: '2025-12-12 19:30',
    status: '已通过'
  },
  {
    id: 3,
    activityName: '创新创业大赛经验分享',
    time: '11月29日 18:30-20:00',
    location: '教学楼301',
    score: 5,
    content: '嘉宾经验丰富，解答问题很耐心，受益匪浅。',
    date: '2025-11-30 08:45',
    status: '审核中'
  }
])
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

