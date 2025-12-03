// 统一响应格式
const success = (res, data, message = 'success') => {
  res.json({
    code: 200,
    message,
    data
  })
}

const error = (res, message = '请求失败', code = 400) => {
  res.status(code).json({
    code,
    message,
    data: null
  })
}

module.exports = { success, error }