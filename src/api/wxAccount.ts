import request from '@/utils/request'
import type {
  BaseResponse,
  WxAccountAddDTO,
  WxAccountUpdateDTO,
  WxAccountPageQueryDTO,
  WxAccountVO,
  Page
} from '@/types'

// 获取access_token
export const getAccessToken = (appId: string) => {
  return request.get<BaseResponse<string>>('/wxAccount/access_token/get', {
    params: { appId }
  })
}

// 新增公众号
export const addWxAccount = (data: WxAccountAddDTO) => {
  return request.post<BaseResponse<number>>('/wxAccount/add', data)
}

// 更新公众号信息
export const updateWxAccount = (data: WxAccountUpdateDTO) => {
  return request.post<BaseResponse<boolean>>('/wxAccount/update', data)
}

// 根据appId删除公众号
export const deleteWxAccounts = (appIds: string[]) => {
  return request.post<BaseResponse<boolean>>('/wxAccount/delete', appIds)
}

// 分页查询公众号
export const listWxAccountByPage = (data: WxAccountPageQueryDTO) => {
  return request.get<BaseResponse<Page<WxAccountVO>>>('/wxAccount/page', {
    params: data
  })
}