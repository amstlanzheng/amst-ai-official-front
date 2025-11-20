<template>
  <div class="wx-material-manage">
    <a-card title="微信素材管理">
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
          <a-select
            v-model:value="materialType"
            style="width: 120px"
            @change="handleTypeChange"
          >
            <a-select-option value="image">图片</a-select-option>
            <a-select-option value="voice">音频</a-select-option>
            <a-select-option value="video">视频</a-select-option>
            <a-select-option value="news">图文</a-select-option>
          </a-select>
          <a-upload
            :custom-request="handleUpload"
            :show-upload-list="false"
            :disabled="!selectedAppId"
            :accept="getAcceptTypes()"
            :multiple="false"
            :before-upload="beforeUpload"
          >
            <a-button type="primary" :disabled="!selectedAppId">
              <template #icon>
                <UploadOutlined />
              </template>
              上传素材
            </a-button>
          </a-upload>
        </a-space>
      </template>
      
      
      
      <div v-if="!selectedAppId" class="empty-tip">
        <a-empty description="请先选择一个公众号" />
      </div>
      
      <div v-else>
        <!-- 素材列表 -->
        <div class="material-list">
          <a-spin :spinning="loading">
            <div class="material-grid">
              <div
                v-for="material in materialList"
                :key="material.mediaId"
                class="material-item"
              >
                <a-card
                  hoverable
                  size="small"
                >
                  <template #cover>
                    <div class="material-cover" @click="materialType.value === 'image' ? previewImage(material) : null">
                      <template v-if="materialType === 'image' && material.mediaId">
                      <div class="image-container">
                        <img
                          v-if="materialBlobUrls[material.mediaId]"
                          :src="materialBlobUrls[material.mediaId]"
                          :alt="material.name"
                          @error="handleImageError"
                          @load="handleImageLoad"
                          :style="{ cursor: 'pointer' }"
                        />
                        <div 
                          v-else
                          class="image-placeholder"
                          @mouseenter="loadImageOnHover(material)"
                        >
                          <div class="placeholder-content">
                            <LoadingOutlined />
                            <span>点击加载</span>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="default-cover">
                        <span>{{ getDefaultCoverText() }}</span>
                      </div>
                    </template>
                    </div>
                  </template>
                  <template #actions>
                    <a-button
                      type="text"
                      size="small"
                      @click="downloadMaterialItem(material)"
                      v-if="materialType !== 'news'"
                    >
                      <template #icon>
                        <DownloadOutlined />
                      </template>
                      下载
                    </a-button>
                    <a-button
                      type="text"
                      size="small"
                      @click="showVideoInfo(material)"
                      v-if="materialType === 'video'"
                    >
                      <template #icon>
                        <InfoCircleOutlined />
                      </template>
                      详情
                    </a-button>
                    <a-popconfirm
                      title="确定要删除这个素材吗？"
                      @confirm="deleteMaterialItem(material.mediaId)"
                      ok-text="确定"
                      cancel-text="取消"
                    >
                      <a-button type="text" danger size="small">
                        <template #icon>
                          <DeleteOutlined />
                        </template>
                        删除
                      </a-button>
                    </a-popconfirm>
                  </template>
                  
                  <a-card-meta>
                    <template #title>
                      <div class="material-title">
                        <span class="material-name">{{ material.name }}</span>
                        <a-tag color="blue" size="small">{{ materialType }}</a-tag>
                      </div>
                    </template>
                    <template #description>
                      <div class="material-info">
                        <div>创建时间: {{ formatDate(material.updateTime) }}</div>
                        <div v-if="materialType === 'video'">媒体ID: {{ material.mediaId }}</div>
                      </div>
                    </template>
                  </a-card-meta>
                </a-card>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="materialList.length === 0 && !loading" class="empty-material">
              <a-empty description="暂无素材" />
            </div>
            
            
          </a-spin>
        </div>
      </div>
    </a-card>
    
    <!-- 视频详情模态框 -->
    <a-modal
      v-model:open="videoInfoVisible"
      title="视频素材详情"
      @ok="videoInfoVisible = false"
      :footer="null"
    >
      <a-descriptions v-if="videoInfo" :column="1" bordered>
        <a-descriptions-item label="标题">
          {{ videoInfo.title }}
        </a-descriptions-item>
        <a-descriptions-item label="描述">
          {{ videoInfo.description }}
        </a-descriptions-item>
        <a-descriptions-item label="下载地址">
          <a :href="videoInfo.downUrl" target="_blank">{{ videoInfo.downUrl }}</a>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
    
    <!-- 图片预览模态框 -->
    <a-modal
      v-model:open="imagePreviewVisible"
      title="图片预览"
      @ok="imagePreviewVisible = false"
      :footer="null"
      width="80%"
      centered
    >
      <div class="image-preview-container">
        <img 
          v-if="previewImageUrl" 
          :src="previewImageUrl" 
          style="max-width: 100%; max-height: 70vh; object-fit: contain;"
          @error="handleImageError"
           referrerPolicy="no-referrer"
        />
      </div>
    </a-modal>
    
    <!-- 固定在底部的分页组件 -->
    <div class="fixed-pagination" v-if="totalCount > 0">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
        @change="handlePageChange"
        @showSizeChange="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import type {
  WxAccountVO,
  WxMaterialFileBatchGetNewsItem,
  WxMpMaterialVideoInfoResult,
  WxMaterialQueryRequest
} from '@/types'
import { URLS } from '@/config'
import { listWxAccountByPage } from '@/api/wxAccount'
import {
  listMaterial,
  uploadMaterial,
  deleteMaterial,
  downloadMaterial,
  getVideoInfo
} from '@/api/wxMaterial'

// 公众号列表
const accountList = ref<WxAccountVO[]>([])
const selectedAppId = ref<string>('')

// 素材类型
const materialType = ref<string>('image')

// 素材列表
const materialList = ref<WxMaterialFileBatchGetNewsItem[]>([])
const loading = ref(false)
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 视频详情模态框
const videoInfoVisible = ref(false)
const videoInfo = ref<WxMpMaterialVideoInfoResult | null>(null)

// 图片预览
const imagePreviewVisible = ref(false)
const previewImageUrl = ref<string>('')

// 图片blob URL缓存
const materialBlobUrls = ref<Record<string, string>>({})

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
const handleAccountChange = () => {
  // 清理之前的blob URLs
  Object.values(materialBlobUrls.value).forEach(url => URL.revokeObjectURL(url))
  materialBlobUrls.value = {}
  
  currentPage.value = 1
  getMaterialList()
}

// 素材类型切换
const handleTypeChange = () => {
  // 清理之前的blob URLs
  Object.values(materialBlobUrls.value).forEach(url => URL.revokeObjectURL(url))
  materialBlobUrls.value = {}
  
  currentPage.value = 1
  getMaterialList()
}

// 获取素材列表
const getMaterialList = async () => {
  if (!selectedAppId.value) {
    materialList.value = []
    totalCount.value = 0
    return
  }
  
  loading.value = true
  try {
    const query: WxMaterialQueryRequest = {
      materialType: materialType.value,
      current: currentPage.value,
      pageSize: pageSize.value
    }
    
    const response = await listMaterial(selectedAppId.value, query)
    if (response.code === 0 && response.data) {
      materialList.value = response.data.items || []
      totalCount.value = response.data.totalCount
    }
  } catch (error) {
    console.error('获取素材列表失败:', error)
    materialList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  getMaterialList()
}

// 每页数量变化
const handlePageSizeChange = (current: number, size: number) => {
  currentPage.value = current
  pageSize.value = size
  getMaterialList()
}

// 上传素材
const handleUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options
  
  if (!selectedAppId.value) {
    message.error('请先选择公众号')
    onError(new Error('请先选择公众号'))
    return
  }
  
  // 检查文件类型
  const fileType = file.type
  const uploadType = materialType.value
  
  if (fileType.startsWith('image/') && uploadType !== 'image') {
    message.error('请选择正确的素材类型（图片）')
    onError(new Error('请选择正确的素材类型（图片）'))
    return
  } else if (fileType.startsWith('audio/') && uploadType !== 'voice') {
    message.error('请选择正确的素材类型（音频）')
    onError(new Error('请选择正确的素材类型（音频）'))
    return
  } else if (fileType.startsWith('video/') && uploadType !== 'video') {
    message.error('请选择正确的素材类型（视频）')
    onError(new Error('请选择正确的素材类型（视频）'))
    return
  }
  
  // 检查文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    message.error('文件大小不能超过10MB')
    onError(new Error('文件大小不能超过10MB'))
    return
  }
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      const progress = Math.random() * 90
      onProgress({ percent: progress })
    }, 200)
    
    const response = await uploadMaterial(selectedAppId.value, uploadType, file)
    
    clearInterval(progressInterval)
    onProgress({ percent: 100 })
    
    if (response.code === 0) {
      message.success('上传成功')
      onSuccess(response)
      getMaterialList()
    } else {
      message.error(response.message || '上传失败')
      onError(new Error(response.message || '上传失败'))
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    message.error(error.message || '上传失败')
    onError(error)
  }
}

// 删除素材
const deleteMaterialItem = async (mediaId: string) => {
  if (!selectedAppId.value) {
    message.error('请先选择公众号')
    return
  }
  
  try {
    const response = await deleteMaterial(selectedAppId.value, mediaId)
    if (response.code === 0) {
      message.success('删除成功')
      getMaterialList()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 下载素材
const downloadMaterialItem = async (material: WxMaterialFileBatchGetNewsItem) => {
  if (!selectedAppId.value) {
    message.error('请先选择公众号')
    return
  }
  
  try {
    const response = await downloadMaterial(
      selectedAppId.value,
      material.mediaId,
      material.name
    )
    
    // 检查响应是否为错误
    if (response.data && response.data.type === 'application/json') {
      // 如果返回的是JSON，说明是错误信息
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string)
          message.error(errorData.message || '下载失败')
        } catch (e) {
          message.error('下载失败')
        }
      }
      reader.readAsText(response.data)
      return
    }
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = material.name || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success('下载成功')
  } catch (error: any) {
    console.error('下载失败:', error)
    
    // 更详细的错误处理
    if (error.response) {
      if (error.response.status === 404) {
        message.error('素材文件不存在')
      } else if (error.response.status === 403) {
        message.error('没有下载权限')
      } else {
        message.error(`下载失败: ${error.response.status}`)
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error('下载失败')
    }
  }
}

// 显示视频详情
const showVideoInfo = async (material: WxMaterialFileBatchGetNewsItem) => {
  if (!selectedAppId.value) {
    message.error('请先选择公众号')
    return
  }
  
  try {
    const response = await getVideoInfo(selectedAppId.value, material.mediaId)
    if (response.code === 0 && response.data) {
      videoInfo.value = response.data
      videoInfoVisible.value = true
    }
  } catch (error) {
    console.error('获取视频详情失败:', error)
  }
}

// 获取默认封面文本
const getDefaultCoverText = () => {
  const textMap: Record<string, string> = {
    image: '图片',
    video: '视频',
    voice: '音频',
    news: '图文'
  }
  return textMap[materialType.value] || '素材'
}

// 获取接受的文件类型
const getAcceptTypes = () => {
  const typeMap: Record<string, string> = {
    image: 'image/*',
    video: 'video/*',
    voice: 'audio/*',
    news: 'image/*' // 图文素材通常也是图片
  }
  return typeMap[materialType.value] || '*/*'
}

// 上传前检查
const beforeUpload = (file: File) => {
  // 检查文件大小
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    message.error('文件大小不能超过10MB')
    return false
  }
  
  // 检查文件类型
  const fileType = file.type
  const currentType = materialType.value
  
  if (currentType === 'image' && !fileType.startsWith('image/')) {
    message.error('请选择图片文件')
    return false
  } else if (currentType === 'video' && !fileType.startsWith('video/')) {
    message.error('请选择视频文件')
    return false
  } else if (currentType === 'voice' && !fileType.startsWith('audio/')) {
    message.error('请选择音频文件')
    return false
  }
  
  return true
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
    const parent = img.parentElement
    if (parent) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'image-error'
      errorDiv.innerHTML = `
        <div class="error-content">
          <span>加载失败</span>
        </div>
      `
      parent.appendChild(errorDiv)
    }
  }
}

// 处理图片加载成功
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'block'
  }
}

// 强制刷新图片显示
const forceRefreshImage = (mediaId: string) => {
  // 先清除旧的URL
  if (materialBlobUrls.value[mediaId]) {
    URL.revokeObjectURL(materialBlobUrls.value[mediaId])
    delete materialBlobUrls.value[mediaId]
  }
  
  // 使用nextTick确保DOM更新
  nextTick(() => {
    // 触发Vue的响应式更新
    materialBlobUrls.value = {...materialBlobUrls.value}
    
    // 延迟一点重新加载
    setTimeout(() => {
      const material = materialList.value.find(m => m.mediaId === mediaId)
      if (material) {
        loadImageBlob(material)
      }
    }, 100)
  })
}

// 获取图片URL，处理跨域问题
const getImageUrl = (material: WxMaterialFileBatchGetNewsItem) => {
  if (!material.url) return ''
  
  // 如果URL已经是完整的，直接返回
  if (material.url.startsWith('http')) {
    return material.url
  }
  
  // 对于图片显示，我们可能需要使用API来获取图片数据
  // 这里先尝试直接URL，如果不行再考虑其他方案
  const baseUrl = URLS.BASE_URL
  return `${baseUrl}${material.url.startsWith('/') ? '' : '/'}${material.url}`
}

// 获取图片的代理URL（如果直接URL不行，可以尝试这个）
const getProxyImageUrl = (material: WxMaterialFileBatchGetNewsItem) => {
  if (!material.mediaId) return ''
  
  // 使用后端API获取图片，避免跨域问题
  return `/api/wx/material/${selectedAppId.value}/img_voice/download?materialId=${material.mediaId}&fileName=${encodeURIComponent(material.name)}`
}

// 加载图片blob
const loadImageBlob = async (material: WxMaterialFileBatchGetNewsItem) => {
  if (!selectedAppId.value || !material.mediaId) return
  
  // 如果已经加载过，直接返回
  if (materialBlobUrls.value[material.mediaId]) {
    return materialBlobUrls.value[material.mediaId]
  }
  
  try {
    const response = await downloadMaterial(
      selectedAppId.value,
      material.mediaId,
      material.name
    )
    
    // 从响应头获取正确的MIME类型
    let contentType = response.headers['content-type'] || 'image/jpeg'
    
    // 如果服务器返回的是application/octet-stream，根据文件扩展名推断正确的类型
    if (contentType === 'application/octet-stream') {
      const fileName = material.name.toLowerCase()
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg'
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png'
      } else if (fileName.endsWith('.gif')) {
        contentType = 'image/gif'
      } else if (fileName.endsWith('.webp')) {
        contentType = 'image/webp'
      } else {
        contentType = 'image/jpeg'
      }
    }
    
    // 创建blob URL
    const blob = new Blob([response.data], { type: contentType })
    const blobUrl = URL.createObjectURL(blob)
    
    // 直接设置响应式数据
    materialBlobUrls.value[material.mediaId] = blobUrl
    
    return blobUrl
  } catch (error: any) {
    console.error('加载图片失败:', error)
    return null
  }
}

// 鼠标悬停时加载图片
const loadImageOnHover = async (material: WxMaterialFileBatchGetNewsItem) => {
  if (!materialBlobUrls.value[material.mediaId]) {
    await loadImageBlob(material)
  }
}

// 图片预览
const previewImage = async (material: WxMaterialFileBatchGetNewsItem) => {
  if (materialType === 'image') {
    // 先尝试加载图片
    const blobUrl = await loadImageBlob(material)
    if (blobUrl) {
      previewImageUrl.value = blobUrl
      imagePreviewVisible.value = true
    } else {
      // 如果加载失败，尝试使用原始URL
      previewImageUrl.value = getImageUrl(material)
      imagePreviewVisible.value = true
    }
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}



// 初始化
onMounted(() => {
  getAccountList()
})
</script>

<style scoped>
.wx-material-manage {
  padding: 20px;
}

.empty-tip {
  padding: 50px 0;
}

.material-list {
  margin-top: 20px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.material-item {
  position: relative;
}

.material-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.material-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-info {
  font-size: 12px;
  color: #666;
}

.empty-material {
  padding: 50px 0;
  text-align: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.material-cover {
  height: 150px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.material-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.image-placeholder:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff2f0;
  color: #ff4d4f;
}

.error-content {
  font-size: 12px;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 16px;
}

:deep(.ant-card-cover) {
  height: 150px;
  overflow: hidden;
  padding: 0;
}

.image-preview-container {
  text-align: center;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

/* 固定底部分页样式 */
.fixed-pagination {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  justify-content: center;
}

/* 为主容器添加底部内边距，避免内容被固定分页遮挡 */
.wx-material-manage {
  padding-bottom: 80px; /* 为固定分页留出空间 */
}
</style>