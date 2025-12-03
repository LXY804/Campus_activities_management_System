const sequelize = require('./config/database')
const { QueryTypes } = require('sequelize')

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')

    const [result] = await sequelize.query('SELECT 1 + 1 AS result', {
      type: QueryTypes.SELECT
    })
    console.log('✅ SQL 查询测试成功:', result)

    process.exit(0)
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

testConnection()