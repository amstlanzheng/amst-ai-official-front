import { URLS } from '@/config'

// 健康检查
export const healthCheck = () => {
  return fetch(URLS.HEALTH_CHECK)
    .then(res => res.json())
    .then(data => data)
}

export * from './user'
export * from './wxAccount'
export * from './wxMenu'
export * from './wxMaterial'
export * from './wxReplyRule'