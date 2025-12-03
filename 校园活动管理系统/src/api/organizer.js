import request from './request'

// 获取当前组织者发布的活动及报名统计
export const fetchMyActivities = () => request.get('/organizer/activities')

// 获取某个活动的报名列表
export const fetchActivityApplications = (activityId) =>
  request.get(`/organizer/activities/${activityId}/applications`)

// 更新报名状态：status 为 'approved' | 'rejected' | 'cancelled'
export const updateApplicationStatus = (applyId, status) =>
  request.patch(`/organizer/applications/${applyId}`, { status })









