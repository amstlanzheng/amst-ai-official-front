// 健康检查
export const healthCheck = () => {
  return fetch('http://localhost:8866/api/health')
    .then(res => res.json())
    .then(data => data)
}

export * from './user'
export * from './wxAccount'
export * from './wxMenu'
export * from './wxMaterial'
export * from './wxReplyRule'