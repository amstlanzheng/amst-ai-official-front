import request from '@/utils/request'
import type {
  BaseResponse,
  WxMenuButton,
  WxMpMenu
} from '@/types'

// 获取公众号菜单
export const getWxMenu = (appId: string) => {
  return request.get<BaseResponse<WxMpMenu>>(`/wx/menu/get/${appId}`)
}

// 更新菜单
export const updateWxMenu = (appId: string, buttons: WxMenuButton[]) => {
  return request.post<BaseResponse<boolean>>(`/wx/menu/update/${appId}`, buttons)
}

// 删除菜单
export const deleteWxMenu = (appId: string) => {
  return request.post<BaseResponse<boolean>>(`/wx/menu/delete/${appId}`)
}