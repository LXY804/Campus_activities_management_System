<template>
  <div class="statistics">
    <h2 class="page-title">数据统计</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.participationCount }}</div>
        <div class="stat-label">参与活动数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.commentedCount }}</div>
        <div class="stat-label">已评价数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.toEvaluateCount }}</div>
        <div class="stat-label">待评价数</div>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchPersonalStats } from '@/api/user'

const stats = ref({
  participationCount: 0,
  commentedCount: 0,
  toEvaluateCount: 0
})
const loading = ref(false)
const errorMsg = ref('')

const loadStats = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await fetchPersonalStats()
    stats.value = {
      participationCount: data?.participationCount || 0,
      commentedCount: data?.commentedCount || 0,
      toEvaluateCount: data?.toEvaluateCount || 0
    }
  } catch (e) {
    console.error('加载个人统计失败:', e)
    errorMsg.value = e?.response?.data?.message || e?.message || '加载统计数据失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.statistics {
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #939cc1 0%, #dfd0ed 100%);
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
}
</style>

