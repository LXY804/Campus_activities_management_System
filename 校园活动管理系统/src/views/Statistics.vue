<template>
  <div class="statistics">
    <h2 class="page-title">数据统计</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">15</div>
        <div class="stat-label">参与活动数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">8</div>
        <div class="stat-label">已评价数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">120</div>
        <div class="stat-label">累计积分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">5</div>
        <div class="stat-label">待评价数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
</style>

