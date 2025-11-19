<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      width="200"
    >
      <div class="logo">
        <h2 v-if="!collapsed">微信管理</h2>
        <h2 v-else>微信</h2>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>仪表盘</span>
        </a-menu-item>
        
        <a-menu-item key="wx-account">
          <template #icon>
            <WechatOutlined />
          </template>
          <span>公众号管理</span>
        </a-menu-item>
        
        <a-menu-item key="wx-menu">
          <template #icon>
            <MenuOutlined />
          </template>
          <span>菜单管理</span>
        </a-menu-item>
        
        <a-menu-item key="wx-material">
          <template #icon>
            <FileImageOutlined />
          </template>
          <span>素材管理</span>
        </a-menu-item>
        
        <a-menu-item key="wx-reply-rule">
          <template #icon>
            <MessageOutlined />
          </template>
          <span>自动回复规则</span>
        </a-menu-item>
        
        <a-menu-item key="user-manage" v-if="userStore.isAdmin()">
          <template #icon>
            <UserOutlined />
          </template>
          <span>用户管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header class="header">
        <div class="header-left">
          <a-button
            type="text"
            @click="collapsed = !collapsed"
            class="trigger"
          >
            <template #icon>
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </template>
          </a-button>
          
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <div class="header-right">
          <a-dropdown>
            <a-avatar :src="userStore.loginUser?.userAvatar">
              {{ userStore.loginUser?.userName?.charAt(0) }}
            </a-avatar>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <template #icon>
                    <UserOutlined />
                  </template>
                  个人信息
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <template #icon>
                    <LogoutOutlined />
                  </template>
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          
          <span class="username">{{ userStore.loginUser?.userName }}</span>
        </div>
      </a-layout-header>
      
      <!-- 内容区域 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  DashboardOutlined,
  WechatOutlined,
  MenuOutlined,
  FileImageOutlined,
  MessageOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const collapsed = ref(false)

// 选中的菜单项
const selectedKeys = ref<string[]>([])

// 展开的子菜单
const openKeys = ref<string[]>([])

// 面包屑导航
interface BreadcrumbItem {
  path: string
  title: string
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = []
  
  // 添加首页
  items.push({ path: '/dashboard', title: '首页' })
  
  // 添加当前页面
  if (route.meta?.title) {
    items.push({ path: route.path, title: route.meta.title as string })
  }
  
  return items
})

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (newPath) => {
    // 根据路径设置选中的菜单项
    const pathSegments = newPath.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    selectedKeys.value = [lastSegment]
  },
  { immediate: true }
)

// 菜单点击处理
const handleMenuClick = ({ key }: { key: string }) => {
  router.push(`/${key}`)
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
}

.header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.breadcrumb {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 500;
}

.content {
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 112px);
  border-radius: 2px;
  overflow-y: auto;
}
</style>