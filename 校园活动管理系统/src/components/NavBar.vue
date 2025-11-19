<template>
    <header class="topbar">
      <div class="container topbar__inner">
        <div class="brand">
          <img class="brand__logo" src="@/assets/header-logo.png" alt="武汉理工大学">
        </div>
        <nav class="nav">
          <router-link class="nav__link" :class="{ active: $route.path === '/' || $route.path === '/home' }" to="/">首页</router-link>
          <router-link class="nav__link" :class="{ active: $route.path === '/promotion' }" to="/promotion">活动宣传</router-link>
          <a class="nav__link" href="#">论坛交流</a>
          <a class="nav__link" href="#">积分礼品</a>
          <router-link class="nav__link" :class="{ active: $route.path.startsWith('/event') }" to="/events">活动信息</router-link>
          <router-link class="nav__link" :class="{ active: $route.path === '/news' }" to="/news">校园资讯</router-link>
        </nav>
        <div class="actions">
          <button class="icon-btn" title="搜索" aria-label="搜索">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/>
              <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- 已登录时显示个人中心按钮 -->
          <router-link v-if="isLoggedIn" to="/personal/activities" class="btn ghost" title="个人中心">个人中心</router-link>
          <!-- 未登录时显示登录按钮 -->
          <router-link v-else to="/login" class="btn ghost" title="登录">登录</router-link>
          <button class="icon-btn" title="系统公告">🔔系统公告</button>
          <!-- 已登录时显示退出按钮 -->
          <button v-if="isLoggedIn" class="btn logout" title="退出登录" @click="handleLogout">退出</button>
          <router-link
            v-if="isOrganizer"
            to="/organizer/manage"
            class="btn ghost"
            title="活动管理"
          >活动管理</router-link>
          <router-link
            v-if="isAdmin"
            to="/admin/dashboard"
            class="btn ghost"
            title="管理后台"
          >管理后台</router-link>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  
  const router = useRouter()
  const route = useRoute()
  const isLoggedIn = ref(false)
  const userRole = ref('')
  const isOrganizer = computed(() => isLoggedIn.value && userRole.value === 'organizer')
  const isAdmin = computed(() => isLoggedIn.value && userRole.value === 'admin')
  
  const syncRole = () => {
    userRole.value = localStorage.getItem('userRole') || ''
  }
  
  const checkLoginStatus = () => {
    isLoggedIn.value = !!localStorage.getItem('isLoggedIn')
    if (isLoggedIn.value) {
      syncRole()
    } else {
      userRole.value = ''
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    isLoggedIn.value = false
    userRole.value = ''
    router.push('/')
  }
  
  onMounted(() => {
    checkLoginStatus()
    // 监听storage变化，以便在多个标签页间同步登录状态
    window.addEventListener('storage', checkLoginStatus)
  })
  
  onUnmounted(() => {
    window.removeEventListener('storage', checkLoginStatus)
  })
  
  // 监听路由变化，更新登录状态
  watch(() => route.path, () => {
    checkLoginStatus()
  })
  </script>
  
  <style scoped>
  .topbar{
    position:sticky;
    top:0;
    z-index:100;
    background:hsl(220, 91%, 30%);
    color:#fff;
    border-bottom:1px solid rgba(255,255,255,.08)
  }
  .container{
    width:100%;
    max-width:1200px;
    padding:0 16px;
    margin:0 auto
  }
  .topbar__inner{
    display:flex;
    align-items:center;
    height:64px;
    gap:16px;
    transform:translateX(-120px)
  }
  .brand{
    display:flex;
    align-items:center;
    gap:8px
  }
  .brand__logo{
    height:40px;
    max-width:180px;
    object-fit:contain
  }
  .brand__name{
    font-weight:700;
    font-size:25px;
    line-height:1.2;
    display:flex;
    align-items:center;
    height:auto;
    white-space:nowrap
  }
  .nav{
    display:flex;
    align-items:center;
    gap:28px;
    margin-left:60px;
    flex:1
  }
  .nav__link{
    color:#dfe8ff;
    text-decoration:none;
    padding:8px 10px;
    border-radius:8px;
    transition:background-color .2s,color .2s;
    font-size:20px;
    white-space:nowrap;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    line-height:1.2;
    height:auto
  }
  .nav__link:hover{
    background:rgba(255,255,255,.12);
    color:#fff
  }
  .nav__link.active{
    background:#fff;
    color:#0d47a1;
    font-weight:700
  }
  .actions{
    display:flex;
    align-items:center;
    gap:20px;
    position:relative
  }
  .icon-btn{
    display:flex;
    align-items:center;
    justify-content:center;
    height:36px;
    min-width:36px;
    padding:0 10px;
    border-radius:8px;
    border:0;
    background:rgba(255,255,255,.16);
    color:#fff;
    cursor:pointer;
    line-height:1.2;
    white-space:nowrap
  }
  .icon-btn:hover{
    background:rgba(255,255,255,.12);
    border-color:#fff
  }
  .icon-btn:focus-visible{
    outline:0;
    box-shadow:0 0 0 2px #fff
  }
  .icon{
    width:20px;
    height:20px;
    display:block
  }
  .btn{
    height:36px;
    padding:0 14px;
    border-radius:8px;
    border:none;
    cursor:pointer;
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    line-height:1.2;
    font-size:15px;
    white-space:nowrap
  }
  .btn.ghost{
    background:#fff;
    color:#0d47a1;
    font-weight:600
  }
  .btn.ghost:hover{
    opacity:0.9
  }
  .btn.logout{
    background:rgba(255,255,255,0.2);
    color:#fff;
    font-weight:600;
    white-space:nowrap
  }
  .btn.logout:hover{
    background:rgba(255,255,255,0.3)
  }
  </style>