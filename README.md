# 微信公众号管理系统

基于 Vue3 + TypeScript + Ant Design Vue + Pinia 开发的微信公众号管理系统。

## 功能特性

- 🔐 用户认证：登录、注册、注销
- 👥 用户管理：用户增删改查（管理员权限）
- 📱 公众号管理：公众号的增删改查
- 📋 菜单管理：微信公众号菜单的可视化配置
- 📁 素材管理：图片、音频、视频、图文素材管理
- 🛡️ 路由守卫：登录状态检查和权限控制

## 技术栈

- **前端框架**：Vue 3.5+
- **类型系统**：TypeScript
- **UI组件库**：Ant Design Vue 4.x
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **HTTP客户端**：Axios
- **构建工具**：Vite

## 项目结构

```
src/
├── api/              # API接口
│   ├── index.ts      # API入口
│   ├── user.ts       # 用户相关接口
│   ├── wxAccount.ts  # 公众号相关接口
│   ├── wxMenu.ts     # 菜单相关接口
│   └── wxMaterial.ts # 素材相关接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── layouts/          # 布局组件
│   └── MainLayout.vue # 主布局
├── router/           # 路由配置
│   └── index.ts      # 路由定义和守卫
├── stores/           # 状态管理
│   └── user.ts       # 用户状态
├── types/            # 类型定义
│   └── index.ts      # 通用类型
├── utils/            # 工具函数
│   └── request.ts    # HTTP请求封装
├── views/            # 页面组件
│   ├── LoginView.vue         # 登录页
│   ├── RegisterView.vue      # 注册页
│   ├── DashboardView.vue     # 仪表盘
│   ├── UserManageView.vue    # 用户管理
│   ├── WxAccountManageView.vue # 公众号管理
│   ├── WxMenuManageView.vue  # 菜单管理
│   ├── WxMaterialManageView.vue # 素材管理
│   └── NotFoundView.vue      # 404页面
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 开发环境要求

- Node.js >= 20.19.0 || >= 22.12.0
- npm >= 7.0.0

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run type-check
```

## 环境配置

项目默认后端API地址为 `http://localhost:8866/api`，如需修改请编辑 `src/utils/request.ts` 文件中的 `baseURL`。

## 主要功能说明

### 用户认证

- 支持用户注册和登录
- 登录状态持久化（localStorage）
- 路由级别的权限控制

### 公众号管理

- 支持添加、编辑、删除公众号
- 获取公众号Access Token
- 支持按名称、AppID、认证状态筛选

### 菜单管理

- 可视化菜单配置
- 支持主菜单和子菜单
- 支持多种菜单类型（点击、跳转、小程序等）
- 实时预览菜单效果

### 素材管理

- 支持图片、音频、视频、图文素材
- 素材上传和下载
- 素材删除和详情查看
- 分页浏览

## 注意事项

1. 本项目仅实现了前端功能，需要配合对应的后端API使用
2. 微信消息接口（供微信调用）未实现前端对接
3. 部分功能需要管理员权限才能访问
4. 建议使用现代浏览器（Chrome、Firefox、Safari等）

## 开发说明

- 项目使用 Composition API 风格
- 遵循 TypeScript 严格模式
- 使用 Ant Design Vue 作为UI组件库
- 使用 Pinia 进行状态管理
- 路由守卫实现了基本的权限控制

## License

MIT