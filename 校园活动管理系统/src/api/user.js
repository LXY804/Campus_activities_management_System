import request from './request'

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

// 管理员：获取用户列表
export const fetchUserList = (params) =>
  request.get('/users/list', { params })

// 管理员：获取用户统计
export const fetchUserStats = () =>
  request.get('/users/stats')

// 管理员：获取本月新增用户数
export const fetchNewUsersThisMonth = () =>
  request.get('/users/stats/new-users')

// 管理员：获取系统配置
export const fetchSystemConfig = () =>
  request.get('/users/config')

// 管理员：保存系统配置
export const saveSystemConfig = (data) =>
  request.put('/users/config', data)

// 管理员：获取活动统计
export const fetchActivityStats = (params) =>
  request.get('/users/stats/activities', { params })

// 用户：获取个人统计数据
export const fetchPersonalStats = () =>
  request.get('/users/stats/personal')

