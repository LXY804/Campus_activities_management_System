import request from './request'

export const fetchProfile = () => request.get('/users/profile')

export const updateProfile = (data) => request.put('/users/profile', data)




