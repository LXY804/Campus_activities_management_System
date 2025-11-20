<template>
  <div class="personal-center">
    <!-- 顶部导航栏 -->
    <NavBar />

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'

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
.personal-center {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f9fc;
  overflow: hidden;
}

.main-layout {
  display: flex;
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 16px;
  gap: 20px;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
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
  gap: 8px;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  transition: all 0.2s;
  font-size: 15px;
}

.sidebar-nav__item:hover {
  background: #f5f5f5;
  color: #333;
}

.sidebar-nav__item.active {
  background: #1565c0;
  color: #fff;
}

.sidebar-nav__icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

