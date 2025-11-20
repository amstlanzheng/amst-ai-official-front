// API配置文件
export const API_CONFIG = {
  // 开发环境API地址
  // BASE_URL: 'http://localhost:8866',
  BASE_URL: 'https://officail.amstlan.com',
  // API路径前缀
  API_PREFIX: '/api',
  // 完整的API基础地址
  get API_BASE_URL() {
    return this.BASE_URL + this.API_PREFIX
  }
}

// 导出常用的URL组合
export const URLS = {
  BASE_URL: API_CONFIG.BASE_URL,
  API_BASE_URL: API_CONFIG.API_BASE_URL,
  HEALTH_CHECK: `${API_CONFIG.API_BASE_URL}/health`
}
