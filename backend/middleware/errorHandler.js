const errorHandler = (err, req, res, next) => {
    console.error('错误:', err)
    
    res.status(500).json({
      code: 500,
      message: err.message || '服务器错误',
      data: null
    })
  }
  
  module.exports = errorHandler