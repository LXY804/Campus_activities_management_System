import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code !== 200) {
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res.data ?? null
    }
    return res
  },
  (error) => {
    // 处理 HTTP 错误响应
    if (error.response) {
      const { status, data } = error.response
      
      // 401 未授权
      if (status === 401) {
        // 如果是登录接口，不清理 token 和跳转，让登录页面显示错误
        const isLoginRequest = error.config?.url?.includes('/auth/login')
        if (!isLoginRequest) {
          localStorage.removeItem('token')
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('username')
          localStorage.removeItem('userRole')
          window.location.href = '/login'
        }
        // 返回错误信息，优先使用后端返回的 message
        const errorMessage = data?.message || '认证失败'
        return Promise.reject(new Error(errorMessage))
      } else if (status === 403) {
        // 403 权限不足，不跳转，让调用方处理
        const errorMessage = data?.message || '您没有权限执行此操作'
        return Promise.reject(new Error(errorMessage))
      } else {
        // 其他 HTTP 错误
        const errorMessage = data?.message || error.message || '请求失败'
        return Promise.reject(new Error(errorMessage))
      }
    }
    
    // 网络错误或其他错误
    return Promise.reject(error)
  }
)

export default request




