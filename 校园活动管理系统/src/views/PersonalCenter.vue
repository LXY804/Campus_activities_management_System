<template>
  <div class="personal-center page" :style="bgStyle">
    <div class="bg-overlay"></div>
    <div class="content">
      <!-- 顶部导航栏 -->
      <div class="nav-bar-wrapper">
        <NavBar />
      </div>

      <div class="main-layout">
        <!-- 左侧边栏 -->
        <aside class="sidebar">
        <div class="user-info">
          <div class="user-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="username">{{ username }}</div>
        </div>
        <nav class="sidebar-nav">
          <router-link 
            to="/personal/info" 
            class="sidebar-nav__item"
            :class="{ active: $route.path === '/personal/info' }"
          >
            <svg class="sidebar-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>个人信息</span>
          </router-link>
          <router-link 
            to="/personal/activities" 
            class="sidebar-nav__item"
            :class="{ active: $route.path === '/personal/activities' }"
          >
            <svg class="sidebar-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>我的活动</span>
          </router-link>
          <router-link 
            to="/personal/comments" 
            class="sidebar-nav__item"
            :class="{ active: $route.path === '/personal/comments' }"
          >
            <svg class="sidebar-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>我的评论</span>
          </router-link>
          <router-link 
            to="/personal/statistics" 
            class="sidebar-nav__item"
            :class="{ active: $route.path === '/personal/statistics' }"
          >
            <svg class="sidebar-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>数据统计</span>
          </router-link>
        </nav>
        </aside>

        <!-- 主内容区 -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import libraryImg from '@/assets/图书馆.webp'

const bgStyle = {
  backgroundImage: `url(${libraryImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  minHeight: '100vh'
}
const router = useRouter()
const username = ref('用户名')

onMounted(() => {
  // 检查登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const savedUsername = localStorage.getItem('username')
  
  if (!isLoggedIn) {
    router.push('/login')
  } else if (savedUsername) {
    username.value = savedUsername
  }
  
  // 如果直接访问 /personal，默认跳转到 /personal/activities
  if (router.currentRoute.value.path === '/personal') {
    router.replace('/personal/activities')
  }
})
</script>

<style scoped>


.personal-center.page {
  position: relative;
  min-height: 100vh;
  overflow: auto;
}

.personal-center .content{
  position: relative;
  z-index: 2;
  display:flex;
  flex-direction:column;
  min-height:100vh;
  padding-top:82px;
}

.nav-bar-wrapper{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  z-index:20;
  background:rgba(255,255,255,0.95);
  backdrop-filter:blur(6px);
  box-shadow:0 2px 10px rgba(0,0,0,0.08);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  z-index: 0;
  pointer-events: none;
}

.main-layout {
  display: flex;
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 16px auto 0;
  padding: 20px 16px 40px;
  gap: 20px;
  align-items: stretch;
}

.sidebar {
  width: 250px;
  background: rgba(255,255,255,0.78);
  border-radius: 28px;
  padding: 36px 26px;
  align-self: stretch;
  box-shadow: 0 25px 45px rgba(15,35,95,0.18);
  backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,0.3);
  display:flex;
  flex-direction:column;
  margin-top:-20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid rgba(255,255,255,0.5);
  margin-bottom: 24px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.user-avatar svg {
  width: 32px;
  height: 32px;
  color: #666;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-radius: 14px;
  text-decoration: none;
  color: #1c2a3c;
  transition: all 0.2s;
  font-size: 15px;
  font-weight:600;
}

.sidebar-nav__item:hover {
  background: rgba(255,255,255,0.6);
  color: #1c2a3c;
}

.sidebar-nav__item.active {
  background: linear-gradient(135deg,#195dc5,#114693);
  color: #fff;
  box-shadow:0 10px 18px rgba(25,93,197,.3);
}

.sidebar-nav__icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
  background: rgba(255,255,255,0.8);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px rgba(15,35,95,0.15);
  backdrop-filter: blur(10px);
  border:1px solid rgba(255,255,255,0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content > * {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>

