<template>
  <div class="auth-container">
    <!-- 切换标签页 -->
    <div class="tab-switcher">
      <button 
        class="tab-button"
        :class="{ active: isLogin }"
        @click="isLogin = true"
      >
        登录
      </button>
      <button 
        class="tab-button"
        :class="{ active: !isLogin }"
        @click="isLogin = false"
      >
        注册
      </button>
    </div>

    <!-- 登录表单 -->
    <form v-show="isLogin" class="auth-form login-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <input 
            v-model="loginForm.username" 
            type="text" 
            placeholder="用户名"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="role-label">选择身份</label>
        <div class="role-options">
          <label class="radio-option">
            <input 
              v-model="loginForm.role" 
              type="radio" 
              value="student"
            />
            <span>学生</span>
          </label>
          <label class="radio-option">
            <input 
              v-model="loginForm.role" 
              type="radio" 
              value="admin"
            />
            <span>管理员</span>
          </label>
          <label class="radio-option">
            <input 
              v-model="loginForm.role" 
              type="radio" 
              value="organizer"
            />
            <span>组织者</span>
          </label>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? '处理中...' : '登录' }}
      </button>
    </form>

    <!-- 注册表单 -->
    <form v-show="!isLogin" class="auth-form register-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <input 
            v-model="registerForm.username" 
            type="text" 
            placeholder="用户名"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <input 
            v-model="registerForm.phone" 
            type="tel" 
            placeholder="电话号码"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
          <input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="密码"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <svg class="input-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
          <input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="确认密码"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="role-label">选择身份</label>
        <div class="role-options">
          <label class="radio-option">
            <input 
              v-model="registerForm.role" 
              type="radio" 
              value="student"
            />
            <span>学生</span>
          </label>
          <label class="radio-option">
            <input 
              v-model="registerForm.role" 
              type="radio" 
              value="admin"
            />
            <span>管理员</span>
          </label>
          <label class="radio-option">
            <input 
              v-model="registerForm.role" 
              type="radio" 
              value="organizer"
            />
            <span>组织者</span>
          </label>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? '处理中...' : '注册' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/auth'

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: '',
  role: 'student'
})

const registerForm = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'student'
})

const persistSession = (payload, fallbackRole = 'student', fallbackUsername = '') => {
  if (!payload) return
  localStorage.setItem('token', payload.token || '')
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('username', payload.username || fallbackUsername)
  localStorage.setItem('userRole', payload.role || fallbackRole)
  localStorage.setItem('userId', payload.userId || '')
}

const handleLogin = async () => {
  const { username, password, role } = loginForm.value

  if (!username || !password) {
    alert('请填写用户名和密码')
    return
  }

  loading.value = true
  try {
    const data = await login({ username, password, role })
    persistSession(data, role, username)
    alert('登录成功')
    router.push('/')
  } catch (err) {
    alert(err?.message || '登录失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const { username, phone, password, confirmPassword, role } = registerForm.value

  if (!username || !phone || !password || !confirmPassword) {
    alert('请填写所有字段')
    return
  }

  if (password !== confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  if (password.length < 6) {
    alert('密码长度不少于6位')
    return
  }

  loading.value = true
  try {
    const data = await register({ username, phone, password, role })
    persistSession(data, 'student', username)
    localStorage.setItem('userPhone', phone)
    alert('注册成功，已自动登录')
    router.push('/')
  } catch (err) {
    alert(err?.message || '注册失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  width: 100%;
}

.tab-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.tab-button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #666;
}

.tab-button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #999;
  flex-shrink: 0;
}

.input-wrapper input {
  flex: 1;
  border: none;
  padding: 12px 0;
  font-size: 14px;
  background: transparent;
  outline: none;
  color: #000;
}

.input-wrapper input::placeholder {
  color: #ccc;
}

.role-label {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.role-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.radio-option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #667eea;
}

.radio-option span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.submit-btn {
  padding: 12px;
  background: linear-gradient(135deg, #3b54c6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
