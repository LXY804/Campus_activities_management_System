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

