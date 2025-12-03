<template>
  <div class="personal-info">
    <h2 class="page-title">我的基本信息</h2>
    <div class="info-form">
      <div class="form-grid">
        <!-- 前两行和照片的容器 -->
        <div class="form-rows-with-photo">
          <!-- 第一行 -->
          <div class="form-row">
            <div class="form-group">
              <label>学号</label>
              <input type="text" v-model="form.studentId" placeholder="请输入学号" />
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="form.name" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>用户角色</label>
              <input type="text" v-model="form.role" placeholder="请输入用户角色" />
            </div>
          </div>

          <!-- 第二行 -->
          <div class="form-row">
            <div class="form-group">
              <label>性别</label>
              <input type="text" v-model="form.gender" placeholder="请输入性别" />
            </div>
            <div class="form-group">
              <label>证件类型</label>
              <input type="text" v-model="form.idType" placeholder="请输入证件类型" />
            </div>
            <div class="form-group">
              <label>身份证件号</label>
              <input type="text" v-model="form.idNumber" placeholder="请输入身份证件号" />
            </div>
          </div>

          <!-- 照片区域（跨两行） -->
          <div class="photo-group">
            <label>照片</label>
            <div class="photo-container">
              <div class="photo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>上传照片</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 第三行 -->
        <div class="form-row">
          <div class="form-group">
            <label>手机号</label>
            <input type="text" v-model="form.phone" placeholder="请输入手机号" />
          </div>
          <div class="form-group">
            <label>邮箱地址</label>
            <input type="email" v-model="form.email" placeholder="请输入邮箱地址" />
          </div>
          <div class="form-group">
            <label>所在学院</label>
            <input type="text" v-model="form.college" placeholder="请输入所在学院" />
          </div>
        </div>

        <!-- 第四行 -->
        <div class="form-row">
          <div class="form-group">
            <label>所在班级</label>
            <input type="text" v-model="form.class" placeholder="请输入所在班级" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-submit" type="button" @click="handleSubmit" :disabled="loading">
          {{ loading ? '保存中...' : '确认修改' }}
        </button>
      </div>

      <div class="form-notice">
        请完善个人信息后再参加活动!!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchProfile, updateProfile } from '@/api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  studentId: '',
  name: '',
  role: '',
  gender: '',
  idType: '',
  idNumber: '',
  phone: '',
  email: '',
  college: '',
  class: ''
})

const loading = ref(false)

const requireLogin = () => {
  if (!localStorage.getItem('token')) {
    if (confirm('需要登录后才能查看个人信息，是否前往登录？')) {
      router.push('/login')
    }
    return false
  }
  return true
}

const loadProfile = async () => {
  if (!requireLogin()) return
  try {
    const data = await fetchProfile()
    form.value = {
      studentId: data?.student_id || '',
      name: data?.real_name || data?.username || '',
      role: data?.role || '',
      gender: data?.gender || '',
      idType: '身份证',
      idNumber: '',
      phone: data?.phone || '',
      email: data?.email || '',
      college: data?.department || '',
      class: data?.grade || ''
    }
  } catch (err) {
    alert(err?.message || '加载个人信息失败')
  }
}

const handleSubmit = async () => {
  if (!requireLogin() || loading.value) return
  loading.value = true
  try {
    await updateProfile({
      studentId: form.value.studentId,
      realName: form.value.name,
      role: form.value.role,
      gender: form.value.gender,
      phone: form.value.phone,
      email: form.value.email,
      college: form.value.college,
      className: form.value.class
    })
    alert('信息已更新')
  } catch (err) {
    alert(err?.message || '更新失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.personal-info {
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.info-form {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 前两行和照片的容器 */
.form-rows-with-photo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 320px)) 220px;
  gap: 24px;
  align-items: start;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 320px));
  gap: 24px;
  grid-column: 1 / 4; /* 占据前3列 */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.3s;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.form-group input:focus {
  outline: none;
  border-color: #1565c0;
}

.form-group input::placeholder {
  color: #999;
}

/* 照片区域跨两行 */
.photo-group {
  grid-column: 4;
  grid-row: 1 / 3; /* 跨第一行和第二行 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  margin-left: 20px;
  margin-top: 0;
  padding-top: 0;
}

.photo-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.photo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-placeholder {
  width: 135px;
  height: 135px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s;
  transform: scale(0.9);
}

.photo-placeholder:hover {
  border-color: #1565c0;
  background: #f0f7ff;
}

.photo-placeholder svg {
  width: 43px;
  height: 43px;
  color: #999;
}

.photo-placeholder span {
  font-size: 11px;
  color: #999;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.btn-submit {
  padding: 12px 48px;
  background: #1565c0;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover {
  background: #0d47a1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
}

.btn-submit:active {
  transform: translateY(0);
}

.form-notice {
  margin-top: 24px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 1200px) {
  .form-rows-with-photo {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .photo-group {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .form-rows-with-photo {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    grid-column: 1;
  }
  
  .photo-group {
    grid-column: 1;
  }
  
  .photo-placeholder {
    width: 120px;
    height: 120px;
  }
}
</style>
