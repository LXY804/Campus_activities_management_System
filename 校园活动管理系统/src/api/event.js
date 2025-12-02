import request from './request'

// 公共活动接口
export const fetchEvents = (params) =>
  request.get('/events', { params })

export const fetchEventDetail = (id) =>
  request.get(`/events/${id}`)

export const registerEvent = (id) =>
  request.post(`/events/${id}/register`)

// 组织者提交活动（进入审核队列）
export const createEvent = (data) =>
  request.post('/events', data)

// 组织者：获取自己提交的活动及审核状态
export const fetchOrganizerEvents = () =>
  request.get('/events/organizer/mine')

// 管理员：获取待审核活动列表
export const fetchPendingEvents = () =>
  request.get('/events/admin/pending')

// 管理员：审核通过活动
export const approveEvent = (creationId) =>
  request.post(`/events/admin/${creationId}/approve`)

// 管理员：驳回活动
export const rejectEvent = (creationId, remark) =>
  request.post(`/events/admin/${creationId}/reject`, { remark })
