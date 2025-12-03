import request from './request'

// 个人资料相关
export const fetchProfile = () => request.get('/users/profile')

export const updateProfile = (data) => request.put('/users/profile', data)

// 上传头像
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取学院列表
export const fetchColleges = () => request.get('/users/colleges')

// 管理后台：用户管理 & 统计
export const fetchUserList = (params) => request.get('/users/list', { params })

export const fetchUserStats = () => request.get('/users/stats')

export const fetchNewUsersThisMonth = () => request.get('/users/stats/new-users')

// 管理后台：系统配置
export const fetchSystemConfig = () => request.get('/users/config')

export const saveSystemConfig = (data) => request.put('/users/config', data)

// 管理后台：活动数据统计
export const fetchActivityStats = (params) =>
  request.get('/users/stats/activities', { params })

// 个人中心：个人统计
export const fetchPersonalStats = () => request.get('/users/stats/personal')

