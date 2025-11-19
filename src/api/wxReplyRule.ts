import request from '@/utils/request'
import type { BaseResponse, Page } from '@/types'

// 回复规则匹配值DTO
export interface WxReplyMatchValueDTO {
  matchType?: number // 匹配类型（全匹配还是半匹配）,默认为半匹配
  matchKeyWords?: string // 关键字
}

// 回复内容DTO
export interface WxReplyContentDTO {
  contentType: number // 回复内容类型，默认为文字类型
  articleId?: string // 图文消息的id
  mediaId?: string // 素材Id（图片、音频、视频等）
  textContent?: string // 文本消息内容
}

// 添加回复规则请求
export interface WxReplyRuleAddRequest {
  appId: string // 公众号appid
  ruleName: string // 规则名称
  matchValue?: WxReplyMatchValueDTO[] // 匹配值
  eventKey?: string // 菜单栏点击事件的key
  replyContent: WxReplyContentDTO // 回复内容
  ruleDescription?: string // 规则描述
  replyType: number // 0 为关键词触发、1 为默认触发、2 为被关注触发、3 为菜单点击事件类型
}

// 更新回复规则请求
export interface WxReplyRuleUpdateRequest {
  id: number
  appId?: string // 公众号appid
  ruleName?: string // 规则名称
  matchValue?: WxReplyMatchValueDTO[] // 匹配值
  eventKey?: string // 菜单栏点击事件的key
  replyContent?: WxReplyContentDTO // 回复内容
  ruleDescription?: string // 规则描述
  replyType?: number // 0 为关键词触发、1 为默认触发、2 为被关注触发、3 为菜单点击事件类型
}

// 回复规则VO
export interface WxReplyRuleVO {
  id: number
  appId: string
  ruleName: string
  matchValue: WxReplyMatchValueDTO[] // 匹配值（关键字或者事件的key）
  eventKey?: string // 菜单栏点击事件的key
  replyContent: WxReplyContentDTO // 回复内容
  ruleDescription?: string
  replyType: number
  createTime: string
  updateTime: string
}

// 分页查询回复规则请求
export interface WxReplyRulePageQueryRequest {
  current?: number
  pageSize?: number
  sortField?: string
  sortOrder?: string
  sorterList?: any[]
  ruleName?: string
  replyContent?: string
  replyType?: number // 回复类型：0-关键词触发、1-默认触发、2-被关注触发、3-菜单点击事件类型
}

// 新增回复规则
export const addReplyRule = (data: WxReplyRuleAddRequest) => {
  return request.post<BaseResponse<number>>('/wx/reply/add', data)
}

// 获取回复规则详情
export const getReplyRule = (id: number) => {
  return request.get<BaseResponse<WxReplyRuleVO>>(`/wx/reply/get/vo`, {
    params: { id }
  })
}

// 分页查询回复规则
export const listReplyRules = (appId: string, data: WxReplyRulePageQueryRequest) => {
  return request.post<BaseResponse<Page<WxReplyRuleVO>>>('/wx/reply/page', data, {
    params: { appId }
  })
}

// 更新回复规则
export const updateReplyRule = (data: WxReplyRuleUpdateRequest) => {
  return request.post<BaseResponse<boolean>>('/wx/reply/update', data)
}

// 删除回复规则
export const deleteReplyRule = (id: number) => {
  return request.delete<BaseResponse<boolean>>(`/wx/reply/delete/${id}`)
}