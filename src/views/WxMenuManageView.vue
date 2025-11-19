<template>
  <div class="wx-menu-manage">
    <a-card title="微信菜单管理">
      <template #extra>
        <a-space>
          <a-select
            v-model:value="selectedAppId"
            placeholder="请选择公众号"
            style="width: 200px"
            @change="handleAccountChange"
          >
            <a-select-option
              v-for="account in accountList"
              :key="account.appId"
              :value="account.appId"
            >
              {{ account.name }}
            </a-select-option>
          </a-select>
          <a-button
            type="primary"
            :disabled="!selectedAppId"
            @click="publishMenu"
            :loading="publishLoading"
          >
            发布菜单
          </a-button>
          <a-button
            danger
            :disabled="!selectedAppId"
            @click="deleteMenu"
            :loading="deleteLoading"
          >
            删除菜单
          </a-button>
        </a-space>
      </template>
      
      <div v-if="!selectedAppId" class="empty-tip">
        <a-empty description="请先选择一个公众号" />
      </div>
      
      <div v-else>
        <!-- 菜单编辑区域 -->
        <div class="menu-editor">
          <div class="menu-preview">
            <div class="phone-preview">
              <div class="phone-header">
                <div class="phone-notch"></div>
              </div>
              <div class="phone-body">
                <div class="chat-header">
                  <span>{{ selectedAccount?.name }}</span>
                </div>
                <div class="chat-content">
                  <a-empty description="菜单预览区域" />
                </div>
                <div class="menu-bar">
                  <div
                    v-for="(button, index) in menuButtons"
                    :key="index"
                    class="menu-button"
                    :class="{ active: selectedButtonIndex === index }"
                    @click="selectButton(index)"
                  >
                    {{ button.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="menu-config">
            <a-card title="菜单配置" size="small">
              <template v-if="selectedButton">
                <a-form layout="vertical">
                  <a-form-item label="菜单名称">
                    <a-input v-model:value="selectedButton.name" placeholder="请输入菜单名称" />
                  </a-form-item>
                  
                  <a-form-item label="菜单类型">
                    <a-select v-model:value="selectedButton.type" @change="handleTypeChange">
                      <a-select-option value="click">点击推事件</a-select-option>
                      <a-select-option value="view">跳转网页</a-select-option>
                      <a-select-option value="scancode_push">扫码推事件</a-select-option>
                      <a-select-option value="scancode_waitmsg">扫码带提示</a-select-option>
                      <a-select-option value="pic_sysphoto">系统拍照发图</a-select-option>
                      <a-select-option value="pic_photo_or_album">拍照或者相册发图</a-select-option>
                      <a-select-option value="pic_weixin">微信相册发图</a-select-option>
                      <a-select-option value="location_select">发送位置</a-select-option>
                      <a-select-option value="media_id">下发消息</a-select-option>
                      <a-select-option value="view_limited">跳转图文消息URL</a-select-option>
                      <a-select-option value="miniprogram">跳转小程序</a-select-option>
                    </a-select>
                  </a-form-item>
                  
                  <!-- 根据不同类型显示不同的配置项 -->
                  <template v-if="selectedButton.type === 'click'">
                    <a-form-item label="菜单KEY值">
                      <a-input v-model:value="selectedButton.key" placeholder="请输入菜单KEY值" />
                    </a-form-item>
                  </template>
                  
                  <template v-if="selectedButton.type === 'view'">
                    <a-form-item label="跳转链接">
                      <a-input v-model:value="selectedButton.url" placeholder="请输入跳转链接" />
                    </a-form-item>
                  </template>
                  
                  <template v-if="selectedButton.type === 'miniprogram'">
                    <a-form-item label="小程序的appId">
                      <a-input v-model:value="selectedButton.appId" placeholder="请输入小程序的appId" />
                    </a-form-item>
                    <a-form-item label="小程序的页面路径">
                      <a-input v-model:value="selectedButton.pagePath" placeholder="请输入小程序的页面路径" />
                    </a-form-item>
                  </template>
                  
                  <template v-if="['media_id', 'view_limited'].includes(selectedButton.type || '')">
                    <a-form-item label="素材ID">
                      <a-input v-model:value="selectedButton.mediaId" placeholder="请输入素材ID" />
                    </a-form-item>
                  </template>
                  
                  <template v-if="selectedButton.type === 'view_limited'">
                    <a-form-item label="图文消息ID">
                      <a-input v-model:value="selectedButton.articleId" placeholder="请输入图文消息ID" />
                    </a-form-item>
                  </template>
                  
                  <!-- 子菜单配置 -->
                  <a-form-item>
                    <a-button
                      type="dashed"
                      block
                      @click="addSubButton"
                      :disabled="!canAddSubButton"
                    >
                      <template #icon>
                        <PlusOutlined />
                      </template>
                      添加子菜单
                    </a-button>
                  </a-form-item>
                  
                  <!-- 子菜单列表 -->
                  <div v-if="selectedButton.subButtons && selectedButton.subButtons.length > 0">
                    <a-divider>子菜单</a-divider>
                    <div
                      v-for="(subButton, subIndex) in selectedButton.subButtons"
                      :key="subIndex"
                      class="sub-button-item"
                    >
                      <a-card size="small">
                        <template #title>
                          <a-input
                            v-model:value="subButton.name"
                            placeholder="子菜单名称"
                            style="width: 150px"
                          />
                        </template>
                        <template #extra>
                          <a-button
                            type="text"
                            danger
                            size="small"
                            @click="removeSubButton(subIndex)"
                          >
                            <template #icon>
                              <DeleteOutlined />
                            </template>
                          </a-button>
                        </template>
                        
                        <a-form layout="vertical">
                          <a-form-item label="菜单类型">
                            <a-select v-model:value="subButton.type">
                              <a-select-option value="click">点击推事件</a-select-option>
                              <a-select-option value="view">跳转网页</a-select-option>
                              <a-select-option value="miniprogram">跳转小程序</a-select-option>
                            </a-select>
                          </a-form-item>
                          
                          <template v-if="subButton.type === 'click'">
                            <a-form-item label="菜单KEY值">
                              <a-input v-model:value="subButton.key" placeholder="请输入菜单KEY值" />
                            </a-form-item>
                          </template>
                          
                          <template v-if="subButton.type === 'view'">
                            <a-form-item label="跳转链接">
                              <a-input v-model:value="subButton.url" placeholder="请输入跳转链接" />
                            </a-form-item>
                          </template>
                        </a-form>
                      </a-card>
                    </div>
                  </div>
                  
                  <a-form-item>
                    <a-space>
                      <a-button type="primary" @click="saveMenu">
                        保存配置
                      </a-button>
                      <a-button @click="resetMenu">
                        重置
                      </a-button>
                    </a-space>
                  </a-form-item>
                </a-form>
              </template>
              <template v-else>
                <a-empty description="请选择或添加菜单" />
              </template>
            </a-card>
          </div>
        </div>
        
        <!-- 主菜单配置 -->
        <div class="main-menu-config">
          <a-card title="主菜单配置" size="small">
            <a-button
              type="dashed"
              @click="addMainMenu"
              :disabled="menuButtons.length >= 3"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              添加主菜单
            </a-button>
            
            <div class="main-menu-list">
              <div
                v-for="(button, index) in menuButtons"
                :key="index"
                class="main-menu-item"
              >
                <a-card size="small">
                  <template #title>
                    <a-input
                      v-model:value="button.name"
                      placeholder="菜单名称"
                      style="width: 150px"
                    />
                  </template>
                  <template #extra>
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click="removeMainMenu(index)"
                    >
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </template>
                </a-card>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { WxMenuButton, WxAccountVO } from '@/types'
import { listWxAccountByPage } from '@/api/wxAccount'
import { getWxMenu, updateWxMenu, deleteWxMenu } from '@/api/wxMenu'

// 公众号列表
const accountList = ref<WxAccountVO[]>([])
const selectedAppId = ref<string>('')
const selectedAccount = computed(() => 
  accountList.value.find(account => account.appId === selectedAppId.value)
)

// 菜单数据
const menuButtons = ref<WxMenuButton[]>([])
const selectedButtonIndex = ref<number>(-1)
const selectedButton = computed(() => 
  selectedButtonIndex.value >= 0 ? menuButtons.value[selectedButtonIndex.value] : null
)

// 加载状态
const publishLoading = ref(false)
const deleteLoading = ref(false)

// 是否可以添加子菜单
const canAddSubButton = computed(() => {
  if (!selectedButton.value) return false
  // 如果有子菜单，不能添加同级菜单
  return !selectedButton.value.subButtons || selectedButton.value.subButtons.length < 5
})

// 获取公众号列表
const getAccountList = async () => {
  try {
    const response = await listWxAccountByPage({ current: 1, pageSize: 100 })
    if (response.code === 0 && response.data) {
      accountList.value = response.data.records
    }
  } catch (error) {
    console.error('获取公众号列表失败:', error)
  }
}

// 公众号切换
const handleAccountChange = async (appId: string) => {
  if (!appId) {
    menuButtons.value = []
    selectedButtonIndex.value = -1
    return
  }
  
  try {
    const response = await getWxMenu(appId)
    if (response.code === 0 && response.data && response.data.menu) {
      menuButtons.value = response.data.menu.buttons || []
      selectedButtonIndex.value = menuButtons.value.length > 0 ? 0 : -1
    } else {
      menuButtons.value = []
      selectedButtonIndex.value = -1
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
    menuButtons.value = []
    selectedButtonIndex.value = -1
  }
}

// 选择菜单按钮
const selectButton = (index: number) => {
  selectedButtonIndex.value = index
}

// 添加主菜单
const addMainMenu = () => {
  if (menuButtons.value.length >= 3) {
    message.warning('最多只能添加3个主菜单')
    return
  }
  
  menuButtons.value.push({
    name: '菜单' + (menuButtons.value.length + 1),
    type: 'click'
  })
  selectedButtonIndex.value = menuButtons.value.length - 1
}

// 删除主菜单
const removeMainMenu = (index: number) => {
  menuButtons.value.splice(index, 1)
  if (selectedButtonIndex.value >= menuButtons.value.length) {
    selectedButtonIndex.value = menuButtons.value.length - 1
  }
}

// 添加子菜单
const addSubButton = () => {
  if (!selectedButton.value) return
  
  if (!selectedButton.value.subButtons) {
    selectedButton.value.subButtons = []
  }
  
  if (selectedButton.value.subButtons.length >= 5) {
    message.warning('最多只能添加5个子菜单')
    return
  }
  
  selectedButton.value.subButtons.push({
    name: '子菜单' + (selectedButton.value.subButtons.length + 1),
    type: 'click'
  })
}

// 删除子菜单
const removeSubButton = (index: number) => {
  if (!selectedButton.value || !selectedButton.value.subButtons) return
  selectedButton.value.subButtons.splice(index, 1)
}

// 菜单类型变化处理
const handleTypeChange = () => {
  if (!selectedButton.value) return
  
  // 清空相关字段
  selectedButton.value.key = ''
  selectedButton.value.url = ''
  selectedButton.value.mediaId = ''
  selectedButton.value.articleId = ''
  selectedButton.value.appId = ''
  selectedButton.value.pagePath = ''
}

// 保存菜单配置
const saveMenu = () => {
  message.success('菜单配置已保存（仅本地）')
}

// 发布菜单
const publishMenu = async () => {
  if (!selectedAppId.value) {
    message.warning('请先选择公众号')
    return
  }
  
  publishLoading.value = true
  try {
    const response = await updateWxMenu(selectedAppId.value, menuButtons.value)
    if (response.code === 0) {
      message.success('菜单发布成功')
    }
  } catch (error) {
    console.error('发布菜单失败:', error)
  } finally {
    publishLoading.value = false
  }
}

// 删除菜单
const deleteMenu = async () => {
  if (!selectedAppId.value) {
    message.warning('请先选择公众号')
    return
  }
  
  deleteLoading.value = true
  try {
    const response = await deleteWxMenu(selectedAppId.value)
    if (response.code === 0) {
      message.success('菜单删除成功')
      menuButtons.value = []
      selectedButtonIndex.value = -1
    }
  } catch (error) {
    console.error('删除菜单失败:', error)
  } finally {
    deleteLoading.value = false
  }
}

// 重置菜单
const resetMenu = () => {
  handleAccountChange(selectedAppId.value)
}

// 初始化
onMounted(() => {
  getAccountList()
})
</script>

<style scoped>
.wx-menu-manage {
  padding: 20px;
}

.empty-tip {
  padding: 50px 0;
}

.menu-editor {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.menu-preview {
  flex: 0 0 350px;
}

.phone-preview {
  width: 300px;
  height: 600px;
  border: 10px solid #333;
  border-radius: 30px;
  position: relative;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.phone-header {
  height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-notch {
  width: 150px;
  height: 25px;
  background: #333;
  border-radius: 0 0 15px 15px;
}

.phone-body {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 50px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
}

.chat-content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}

.menu-bar {
  height: 50px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
}

.menu-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-button:last-child {
  border-right: none;
}

.menu-button:hover {
  background: #f0f0f0;
}

.menu-button.active {
  background: #e6f7ff;
  color: #1890ff;
}

.menu-config {
  flex: 1;
}

.main-menu-config {
  margin-top: 20px;
}

.main-menu-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.main-menu-item {
  flex: 1;
}

.sub-button-item {
  margin-bottom: 10px;
}
</style>