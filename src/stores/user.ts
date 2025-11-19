import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginUserVO } from '@/types'
import { userLogin, userLogout, getLoginUser } from '@/api/user'
import { message } from 'ant-design-vue'

export const useUserStore = defineStore('user', () => {
  const loginUser = ref<LoginUserVO | null>(null)
  const isLoggedIn = ref(false)

  // 初始化用户状态
  const initUserState = async () => {
    const userStr = localStorage.getItem('user')
    
    // 如果有本地用户信息，先使用本地信息
    if (userStr) {
      try {
        loginUser.value = JSON.parse(userStr)
        isLoggedIn.value = true
        
        // 尝试从服务器获取最新用户信息来验证登录状态
        await fetchCurrentUser()
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearUserState()
      }
    } else {
      // 没有本地用户信息，尝试从服务器获取
      await fetchCurrentUser()
    }
  }

  // 清除用户状态
  const clearUserState = () => {
    loginUser.value = null
    isLoggedIn.value = false
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // 用户登录
  const login = async (userAccount: string, userPassword: string) => {
    try {
      const response = await userLogin({ userAccount, userPassword })
      if (response.code === 0 && response.data) {
        loginUser.value = response.data
        isLoggedIn.value = true
        
        // 保存用户信息到localStorage
        localStorage.setItem('user', JSON.stringify(response.data))
        
        // 注意：由于设置了withCredentials: true，cookie会自动保存
        // 如果后端返回token在响应头中，我们需要提取它
        // 这里假设后端可能通过Set-Cookie头设置cookie，或者在响应体中返回token
        
        message.success('登录成功')
        return true
      } else {
        message.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      
      // 如果是axios错误，检查响应头中是否有token
      if (error.response && error.response.headers) {
        const token = error.response.headers['authorization'] || error.response.headers['token']
        if (token) {
          localStorage.setItem('token', token)
        }
      }
      
      message.error('登录失败，请检查网络连接')
      return false
    }
  }

  // 用户注销
  const logout = async () => {
    try {
      await userLogout()
      message.success('注销成功')
    } catch (error) {
      console.error('注销失败:', error)
      message.error('注销失败')
    } finally {
      clearUserState()
    }
  }

  // 获取当前登录用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await getLoginUser()
      if (response.code === 0 && response.data) {
        loginUser.value = response.data
        isLoggedIn.value = true
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      } else {
        // 服务器返回错误，清除登录状态
        clearUserState()
        return null
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      
      // 如果是401错误，说明认证失败，清除状态
      if (error.response && error.response.status === 401) {
        clearUserState()
        return null
      }
      
      // 其他错误不清除状态，可能是网络问题
      return null
    }
  }

  // 检查用户权限
  const hasPermission = (role: string) => {
    if (!loginUser.value) return false
    return loginUser.value.userRole === role || loginUser.value.userRole === 'admin'
  }

  // 检查是否为管理员
  const isAdmin = () => {
    return loginUser.value?.userRole === 'admin'
  }

  return {
    loginUser,
    isLoggedIn,
    initUserState,
    clearUserState,
    login,
    logout,
    fetchCurrentUser,
    hasPermission,
    isAdmin
  }
})