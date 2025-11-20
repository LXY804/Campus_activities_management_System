<template>
  <div class="page">
    <NavBar />
    <section class="hero">
      <div class="container hero__inner">
        <h1 class="hero__title">欢迎访问<br/>校园活动管理平台</h1>
        <p class="hero__subtitle">Welcome to the Campus Event Management Platform</p>
      </div>
      <div class="form-wrapper">
        <AuthForm />
      </div>
    </section>
    <section class="stats">
      <div class="container stats__grid">
        <div class="stat"><div class="stat__number">200+</div><div class="stat__label">院校资源</div></div>
        <div class="stat"><div class="stat__number">3500+</div><div class="stat__label">活动总数</div></div>
        <div class="stat"><div class="stat__number">5万+</div><div class="stat__label">参与人数</div></div>
        <div class="stat"><div class="stat__number">1000+</div><div class="stat__label">活动评价</div></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import AuthForm from '@/components/AuthForm.vue'
</script>

<style scoped>
.page {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  background: #f7f9fc;
}

.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 16px;
  margin: 0 auto;
}

.hero {
  background: linear-gradient(180deg, rgba(159, 159, 165, 0.1) 0%, rgba(175, 176, 177, 0.5) 100%), url(../assets/R-C.jpeg) center/cover no-repeat;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  flex: 1;
  position: relative;
}

.hero__inner {
  max-width: 980px;
  flex: 1;
  padding: 60px 16px;
}

.hero__title {
  font-size: 48px;
  line-height: 1.2;
  margin: 0 0 12px;
  font-weight: 800;
}

.hero__subtitle {
  font-size: 16px;
  opacity: 0.95;
}

.form-wrapper {
  width: 100%;
  max-width: 350px;
  background: white;
  padding: 80px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-right: 60px;
  flex-shrink: 0;
}

.stats {
  background: #1565c0;
  color: #fff;
  padding: 16px 0;
  border-top: 4px solid rgba(255, 255, 255, 0.2);
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  text-align: center;
}

.stat {
  padding: 12px 8px;
  border-left: 2px solid rgba(255, 255, 255, 0.25);
}

.stat:first-child {
  border-left: none;
}

.stat__number {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat__label {
  font-size: 14px;
  opacity: 0.9;
}

@media (max-width: 1200px) {
  .form-wrapper {
    margin-right: 20px;
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    justify-content: center;
  }

  .hero__inner {
    padding: 40px 16px;
  }

  .hero__title {
    font-size: 34px;
  }

  .form-wrapper {
    width: calc(100% - 40px);
    margin: 20px;
    padding: 40px 20px;
  }

  .stats__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    max-width: 100%;
    margin: 20px;
    width: calc(100% - 40px);
    padding: 30px 20px;
  }

  .hero__title {
    font-size: 28px;
  }

  .stats__grid {
    grid-template-columns: 1fr;
  }
}
</style>

