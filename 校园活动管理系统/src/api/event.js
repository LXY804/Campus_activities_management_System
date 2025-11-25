import request from './request'

export const fetchEvents = (params) =>
  request.get('/events', { params })

export const fetchEventDetail = (id) =>
  request.get(`/events/${id}`)

export const registerEvent = (id) =>
  request.post(`/events/${id}/register`)

