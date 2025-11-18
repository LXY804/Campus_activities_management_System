import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const PersonalCenter = () => import('../views/PersonalCenter.vue')
const MyActivities = () => import('../views/MyActivities.vue')
const PersonalInfo = () => import('../views/PersonalInfo.vue')
const MyComments = () => import('../views/MyComments.vue')
const Statistics = () => import('../views/Statistics.vue')

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/home', name: 'HomePage', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/personal', 
    component: PersonalCenter,
    redirect: '/personal/activities',
    children: [
      { path: 'info', name: 'PersonalInfo', component: PersonalInfo },
      { path: 'activities', name: 'MyActivities', component: MyActivities },
      { path: 'comments', name: 'MyComments', component: MyComments },
      { path: 'statistics', name: 'Statistics', component: Statistics }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  // 如果访问个人中心相关页面但未登录，跳转到登录页
  if (to.path.startsWith('/personal') && !isLoggedIn) {
    next('/login')
  } 
  // 首页和登录页不需要登录即可访问
  else {
    next()
  }
})

export default router


