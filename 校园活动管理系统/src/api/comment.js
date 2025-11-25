import request from './request'

export const fetchEventComments = (eventId, params) =>
  request.get(`/comments/events/${eventId}`, { params })

export const submitComment = (eventId, data) =>
  request.post(`/comments/events/${eventId}`, data)

export const fetchMyComments = (params) =>
  request.get('/comments/my', { params })

