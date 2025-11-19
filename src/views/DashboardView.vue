<template>
  <div class="dashboard">
    <a-row :gutter="16">
      <!-- 统计卡片 -->
      <a-col :span="6" v-for="stat in stats" :key="stat.key">
        <a-card>
          <a-statistic
            :title="stat.title"
            :value="stat.value"
            :prefix="stat.prefix"
            :suffix="stat.suffix"
            :value-style="{ color: stat.color }"
          />
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 快捷操作 -->
      <a-col :span="12">
        <a-card title="快捷操作">
          <div class="quick-actions">
            <a-button
              type="primary"
              size="large"
              block
              @click="$router.push('/wx-account')"
            >
              <template #icon>
                <WechatOutlined />
              </template>
              管理公众号
            </a-button>
            
            <a-button
              size="large"
              block
              style="margin-top: 8px"
              @click="$router.push('/wx-menu')"
            >
              <template #icon>
                <MenuOutlined />
              </template>
              配置菜单
            </a-button>
            
            <a-button
              size="large"
              block
              style="margin-top: 8px"
              @click="$router.push('/wx-material')"
            >
              <template #icon>
                <FileImageOutlined />
              </template>
              管理素材
            </a-button>
            
            <a-button
              v-if="userStore.isAdmin()"
              size="large"
              block
              style="margin-top: 8px"
              @click="$router.push('/user-manage')"
            >
              <template #icon>
                <UserOutlined />
              </template>
              用户管理
            </a-button>
          </div>
        </a-card>
      </a-col>
      
      <!-- 最近活动 -->
      <a-col :span="12">
        <a-card title="最近活动">
          <a-list :data-source="recentActivities" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.color }">
                      {{ item.avatar }}
                    </a-avatar>
                  </template>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
                <div>{{ item.time }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="系统信息">
          <a-descriptions :column="4" bordered>
            <a-descriptions-item label="系统版本">
              v1.0.0
            </a-descriptions-item>
            <a-descriptions-item label="Vue版本">
              3.x
            </a-descriptions-item>
            <a-descriptions-item label="Ant Design Vue版本">
              4.x
            </a-descriptions-item>
            <a-descriptions-item label="当前用户">
              {{ userStore.loginUser?.userName }}
            </a-descriptions-item>
            <a-descriptions-item label="用户角色">
              <a-tag :color="userStore.isAdmin() ? 'red' : 'blue'">
                {{ userStore.loginUser?.userRole === 'admin' ? '管理员' : '普通用户' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="登录时间">
              {{ formatDate(userStore.loginUser?.createTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="API地址">
              http://localhost:8866/api
            </a-descriptions-item>
            <a-descriptions-item label="系统状态">
              <a-badge status="processing" text="运行中" />
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  WechatOutlined,
  MenuOutlined,
  FileImageOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()

// 统计数据
const stats = ref([
  {
    key: 'accounts',
    title: '公众号数量',
    value: 0,
    color: '#3f8600',
    prefix: '📱'
  },
  {
    key: 'materials',
    title: '素材数量',
    value: 0,
    color: '#cf1322',
    prefix: '📁'
  },
  {
    key: 'menus',
    title: '菜单数量',
    value: 0,
    color: '#1890ff',
    prefix: '📋'
  },
  {
    key: 'users',
    title: '用户数量',
    value: 0,
    color: '#722ed1',
    prefix: '👥'
  }
])

// 最近活动
const recentActivities = ref([
  {
    title: '系统启动',
    description: '微信公众号管理系统已成功启动',
    time: '刚刚',
    avatar: '🚀',
    color: '#87d068'
  },
  {
    title: '用户登录',
    description: `${userStore.loginUser?.userName} 登录系统`,
    time: '刚刚',
    avatar: '👤',
    color: '#108ee9'
  },
  {
    title: '数据同步',
    description: '公众号数据已同步',
    time: '5分钟前',
    avatar: '🔄',
    color: '#f50'
  },
  {
    title: '系统检查',
    description: '系统运行状态正常',
    time: '10分钟前',
    avatar: '✅',
    color: '#52c41a'
  }
])

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 初始化数据
onMounted(() => {
  // 这里可以调用API获取实际的统计数据
  // 目前使用模拟数据
  stats.value[0].value = 3
  stats.value[1].value = 25
  stats.value[2].value = 8
  stats.value[3].value = 12
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}
</style>