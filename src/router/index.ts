import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'layout',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: '仪表盘' }
        },
        {
          path: '/user-manage',
          name: 'user-manage',
          component: () => import('../views/UserManageView.vue'),
          meta: { title: '用户管理', requiresAdmin: true }
        },
        {
          path: '/wx-account',
          name: 'wx-account',
          component: () => import('../views/WxAccountManageView.vue'),
          meta: { title: '公众号管理' }
        },
        {
          path: '/wx-menu',
          name: 'wx-menu',
          component: () => import('../views/WxMenuManageView.vue'),
          meta: { title: '菜单管理' }
        },
        {
          path: '/wx-material',
          name: 'wx-material',
          component: () => import('../views/WxMaterialManageView.vue'),
          meta: { title: '素材管理' }
        },
        {
          path: '/wx-reply-rule',
          name: 'wx-reply-rule',
          component: () => import('../views/WxReplyRuleManageView.vue'),
          meta: { title: '自动回复规则' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 初始化用户状态（现在是异步的）
  await userStore.initUserState()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin()) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
