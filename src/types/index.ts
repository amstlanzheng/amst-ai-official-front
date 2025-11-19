// 通用API响应类型
export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 分页响应类型
export interface Page<T = any> {
  records: T[];
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalRow: number;
  optimizeCountQuery: boolean;
}

// 排序类型
export interface Sorter {
  field: string;
  asc: boolean;
}

// 用户类型
export interface User {
  id: number;
  createTime: string;
  updateTime: string;
  userAccount: string;
  userPassword: string;
  userName: string;
  userAvatar: string;
  userProfile: string;
  userRole: string;
  vipExpireTime: string;
  vipCode: string;
  vipNumber: number;
  shareCode: string;
  inviteUser: number;
  editTime: string;
  isDelete: number;
}

// 用户VO类型
export interface UserVO {
  id: number;
  userAccount: string;
  userName: string;
  userAvatar: string;
  userProfile: string;
  userRole: string;
  createTime: string;
}

// 登录用户VO类型
export interface LoginUserVO {
  id: number;
  userAccount: string;
  userName: string;
  userAvatar: string;
  userProfile: string;
  userRole: string;
  createTime: string;
  updateTime: string;
}

// 用户登录请求
export interface UserLoginRequest {
  userAccount: string;
  userPassword: string;
}

// 用户注册请求
export interface UserRegisterRequest {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
}

// 用户添加请求
export interface UserAddRequest {
  userName: string;
  userAccount: string;
  userAvatar: string;
  userProfile: string;
  userRole: string;
}

// 用户更新请求
export interface UserUpdateRequest {
  id: number;
  userName: string;
  userAvatar: string;
  userProfile: string;
  userRole: string;
}

// 用户查询请求
export interface UserQueryRequest {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  sorterList?: Sorter[];
  userName?: string;
  userAccount?: string;
  userProfile?: string;
  userRole?: string;
}

// 删除请求
export interface DeleteRequest {
  id: number;
}

// 公众号类型
export interface WxAccount {
  id: number;
  appId: string;
  name: string;
  verified: boolean;
  secret: string;
  userId: number;
  user?: UserVO;
  token: string;
  aesKey: string;
  createTime: string;
  updateTime: string;
}

// 公众号VO类型
export interface WxAccountVO {
  id: number;
  appId: string;
  name: string;
  verified: boolean;
  secret: string;
  userId: number;
  user?: UserVO;
  token: string;
  aesKey: string;
  createTime: string;
  updateTime: string;
}

// 公众号添加请求
export interface WxAccountAddDTO {
  appId: string;
  name: string;
  secret: string;
  token: string;
  aesKey: string;
}

// 公众号更新请求
export interface WxAccountUpdateDTO {
  id: number;
  appId?: string;
  name?: string;
  secret?: string;
  token?: string;
  aesKey?: string;
}

// 公众号分页查询请求
export interface WxAccountPageQueryDTO {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  sorterList?: Sorter[];
  appId?: string;
  name?: string;
  verified?: boolean;
  secret?: string;
  token?: string;
  aesKey?: string;
}

// 微信菜单按钮类型
export interface WxMenuButton {
  type?: string;
  name?: string;
  key?: string;
  url?: string;
  mediaId?: string;
  articleId?: string;
  appId?: string;
  pagePath?: string;
  subButtons?: WxMenuButton[];
}

// 微信菜单规则类型
export interface WxMenuRule {
  tagId?: string;
  sex?: string;
  country?: string;
  province?: string;
  city?: string;
  clientPlatformType?: string;
  language?: string;
}

// 微信条件菜单类型
export interface WxMpConditionalMenu {
  buttons: WxMenuButton[];
  rule?: WxMenuRule;
  menuId?: string;
}

// 微信菜单类型
export interface WxMpMenu {
  menu?: WxMpConditionalMenu;
  conditionalMenu?: WxMpConditionalMenu[];
}

// 微信素材查询请求
export interface WxMaterialQueryRequest {
  current?: number;
  pageSize?: number;
  materialType: string; // image,voice,video,news
}

// 微信素材文件项
export interface WxMaterialFileBatchGetNewsItem {
  mediaId: string;
  updateTime: string;
  name: string;
  url: string;
}

// 微信素材批量获取结果
export interface WxMpMaterialFileBatchGetResult {
  totalCount: number;
  itemCount: number;
  items: WxMaterialFileBatchGetNewsItem[];
}

// 微信视频素材信息
export interface WxMpMaterialVideoInfoResult {
  title: string;
  description: string;
  downUrl: string;
}