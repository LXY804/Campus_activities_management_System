import request from './request'

export const fetchMyRegistrations = (params) =>
  request.get('/registrations/my', { params })

export const cancelRegistration = (id) =>
  request.delete(`/registrations/${id}`)

