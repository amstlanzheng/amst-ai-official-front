import request from '@/utils/request'
import axios from 'axios'
import { URLS } from '@/config'
import type {
  BaseResponse,
  WxMaterialQueryRequest,
  WxMpMaterialFileBatchGetResult,
  WxMpMaterialVideoInfoResult
} from '@/types'

// 查询素材列表
export const listMaterial = (appId: string, data: WxMaterialQueryRequest) => {
  return request.post<BaseResponse<WxMpMaterialFileBatchGetResult>>(`/wx/material/${appId}/list`, data)
}

// 上传素材（图片、音频、视频）
export const uploadMaterial = (appId: string, materialType: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('materialType', materialType)
  
  return request.post<BaseResponse<boolean>>(`/wx/material/${appId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除素材
export const deleteMaterial = (appId: string, materialId: string) => {
  return request.delete<BaseResponse<boolean>>(`/wx/material/${appId}/delete`, {
    params: { materialId }
  })
}

// 下载图片或音频
export const downloadMaterial = (appId: string, materialId: string, fileName: string) => {
  // 创建新的axios实例用于下载，避免响应拦截器干扰
  const downloadInstance = axios.create({
    baseURL: URLS.API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    responseType: 'blob'
  })
  
  return downloadInstance.get(`/wx/material/${appId}/img_voice/download`, {
    params: { materialId, fileName }
  })
}

// 查询视频详情
export const getVideoInfo = (appId: string, materialId: string) => {
  return request.get<BaseResponse<WxMpMaterialVideoInfoResult>>(`/wx/material/${appId}/video/info`, {
    params: { materialId }
  })
}