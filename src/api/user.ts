import request from '@/utils/request'
import type {
  BaseResponse,
  LoginUserVO,
  UserLoginRequest,
  UserRegisterRequest,
  UserAddRequest,
  UserUpdateRequest,
  UserQueryRequest,
  UserVO,
  Page,
  DeleteRequest
} from '@/types'

// 用户登录
export const userLogin = (data: UserLoginRequest) => {
  return request.post<BaseResponse<LoginUserVO>>('/user/login', data)
}

// 用户注册
export const userRegister = (data: UserRegisterRequest) => {
  return request.post<BaseResponse<number>>('/user/register', data)
}

// 用户注销
export const userLogout = () => {
  return request.post<BaseResponse<boolean>>('/user/logout')
}

// 获取当前登录用户
export const getLoginUser = () => {
  return request.get<BaseResponse<LoginUserVO>>('/user/get/login')
}

// 根据id获取用户
export const getUserById = (id: number) => {
  return request.get<BaseResponse<UserVO>>('/user/get', { params: { id } })
}

// 根据id获取用户VO
export const getUserVOById = (id: number) => {
  return request.get<BaseResponse<UserVO>>('/user/get/vo', { params: { id } })
}

// 添加用户
export const addUser = (data: UserAddRequest) => {
  return request.post<BaseResponse<number>>('/user/add', data)
}

// 更新用户
export const updateUser = (data: UserUpdateRequest) => {
  return request.post<BaseResponse<boolean>>('/user/update', data)
}

// 删除用户
export const deleteUser = (data: DeleteRequest) => {
  return request.post<BaseResponse<boolean>>('/user/delete', data)
}

// 分页获取用户列表
export const listUserByPage = (data: UserQueryRequest) => {
  return request.post<BaseResponse<Page<UserVO>>>('/user/list/page/vo', data)
}