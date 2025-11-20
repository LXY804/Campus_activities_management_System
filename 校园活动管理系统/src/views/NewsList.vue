<template>
  <div class="page">
    <NavBar />

    <!-- 最新资讯标题 -->
    <div class="title-section">
      <h2>最新资讯</h2>
      <div class="underline"></div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧轮播图 -->
      <div class="carousel-container">
        <img :src="currentImage" alt="轮播图" class="carousel-image" />
        <div class="carousel-controls">
          <button @click="prevImage" class="control-btn">&lt;</button>
          <button @click="nextImage" class="control-btn">&gt;</button>
        </div>
        <div class="carousel-info">
          <div class="date">12</div>
          <div class="year">2025.10</div>
          <p>2025 年下半年全国大学英语四、六级考试笔试将于 12 月 13 日举行</p>
        </div>
      </div>

      <!-- 右侧资讯卡片 -->
      <div class="news-cards">
        <div class="news-card">
          <div class="date-box">
            <div class="day">12</div>
            <div class="month">2025.10</div>
          </div>
          <p>根据中国教育考试网的信息，2025 年下半年全国大学英语四、六级考试笔试将于 12 月 13 日举行，其中英语四级考试时间为 9：00-11：20，英语六级考试时间为 15：00-17：25。口试将于 11 月 22 日至 23 日举行，11 月 22 日进行英语四级口语考试，11 月 23 日进行英语六级口语考试。</p>
        </div>
        <div class="news-card blue">
          <div class="date-box">
            <div class="day">12</div>
            <div class="month">2025.10</div>
          </div>
          <p>雅思成绩被纳入美国 O-1 杰出人才签证的语言能力证明范畴，在加拿大移民申请中，雅思成绩的权重进一步提高，在欧洲部分国家的高校申请中，逐渐成为与托福成绩同等有效的语言凭证。</p>
        </div>
        <div class="news-card">
          <div class="date-box">
            <div class="day">12</div>
            <div class="month">2025.10</div>
          </div>
          <p>2025 年英语专业八级（TEM8）拟定于 2025 年 3 月 29 日考试，英语专业四级（TEM4）拟定于 2025 年 6 月 15 日考试。报名资格为通过全国高考正式录取的英语专业学生，TEM4 面向 2023 年入学的英语语言文学和应用翻译学专业二年级本科生，TEM8 面向 2021 年入学的英语语言文学和应用翻译学专业四年级本科生。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

// 轮播图图片数组

const images = [
    new URL('../assets/carousel1.jpg', import.meta.url).href,
    new URL('../assets/carousel2.jpg', import.meta.url).href,
    new URL('../assets/carousel3.jpg', import.meta.url).href
]

const currentImage = ref(images[0])
let currentIndex = 0

const nextImage = () => {
  currentIndex = (currentIndex + 1) % images.length
  currentImage.value = images[currentIndex]
}

const prevImage = () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length
  currentImage.value = images[currentIndex]
}
</script>

<style scoped>
.page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.title-section h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.underline {
  width: 50px;
  height: 4px;
  background-color: #4a3c8b;
  margin: 0 auto;
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 左侧轮播图 */
.carousel-container {
  flex: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carousel-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  transform: translateY(-50%);
  gap: 10px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.carousel-info {
  padding: 15px;
  background-color: white;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.carousel-info .date {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  background-color: #0053a9;
  padding: 10px;
  width: 60px;
  text-align: center;
  border-radius: 4px;
}

.carousel-info .year {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

.carousel-info p {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  flex: 1;
}

/* 右侧资讯卡片 */
.news-cards {
  flex: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.news-card {
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.news-card:hover {
  transform: translateY(-4px);
}

.news-card.blue {
  background-color: #0053a9;
  color: white;
}

.news-card .date-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;
}

.news-card .day {
  font-size: 3rem;
  font-weight: bold;
}

.news-card .month {
  font-size: 0.9rem;
  opacity: 0.8;
}

.news-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  .news-cards {
    grid-template-columns: 1fr;
  }
  .carousel-container {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .title-section h1 {
    font-size: 2rem;
  }
  .carousel-info {
    flex-direction: column;
    align-items: flex-start;
  }
  .carousel-info .date {
    width: 50px;
    font-size: 2rem;
  }
  .carousel-controls {
    top: 20px;
  }
}
</style>