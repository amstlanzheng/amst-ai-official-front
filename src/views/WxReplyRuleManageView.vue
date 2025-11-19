<template>
  <div class="wx-reply-rule-manage">
    <a-card title="自动回复规则管理">
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
          <a-button type="primary" @click="showAddModal">
            <template #icon>
              <PlusOutlined />
            </template>
            添加规则
          </a-button>
        </a-space>
      </template>
      
      <div v-if="!selectedAppId" class="empty-tip">
        <a-empty description="请先选择一个公众号" />
      </div>
      
      <div v-else>
        <!-- 搜索区域 -->
        <div class="search-area">
          <a-form layout="inline" :model="searchForm" @finish="handleSearch">
            <a-form-item label="规则名称">
              <a-input v-model:value="searchForm.ruleName" placeholder="请输入规则名称" />
            </a-form-item>
            <a-form-item label="回复类型">
              <a-select
                v-model:value="searchForm.replyType"
                placeholder="请选择回复类型"
                style="width: 150px"
                allow-clear
              >
                <a-select-option :value="0">关键词触发</a-select-option>
                <a-select-option :value="1">默认触发</a-select-option>
                <a-select-option :value="2">被关注触发</a-select-option>
                <a-select-option :value="3">菜单点击事件</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit">
                <template #icon>
                  <SearchOutlined />
                </template>
                搜索
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        
        <!-- 表格区域 -->
        <a-table
          :columns="columns"
          :data-source="ruleList"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'replyType'">
              <a-tag :color="getReplyTypeColor(record.replyType)">
                {{ getReplyTypeText(record.replyType) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'matchValue'">
              <div v-if="record.matchValue && record.matchValue.length > 0">
                <a-tag v-for="(match, index) in record.matchValue" :key="index" color="blue">
                  {{ match.matchKeyWords }}
                </a-tag>
              </div>
              <span v-else>-</span>
            </template>
            <template v-if="column.key === 'replyContent'">
              <div class="reply-content">
                <span v-if="record.replyContent && record.replyContent.textContent">
                  {{ record.replyContent.textContent }}
                </span>
                <span v-else-if="record.replyContent && record.replyContent.mediaId">
                  [媒体文件]
                </span>
                <span v-else>-</span>
              </div>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="showEditModal(record)">
                  编辑
                </a-button>
                <a-popconfirm
                  title="确定要删除这个规则吗？"
                  @confirm="handleDelete(record.id)"
                  ok-text="确定"
                  cancel-text="取消"
                >
                  <a-button type="link" danger size="small">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    
    <!-- 添加/编辑规则模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑规则' : '添加规则'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
      width="800px"
    >
      <a-form
        ref="formRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        layout="vertical"
      >
        <a-form-item label="规则名称" name="ruleName">
          <a-input v-model:value="ruleForm.ruleName" placeholder="请输入规则名称" />
        </a-form-item>
        
        <a-form-item label="回复类型" name="replyType">
          <a-select v-model:value="ruleForm.replyType" @change="handleReplyTypeChange">
            <a-select-option :value="0">关键词触发</a-select-option>
            <a-select-option :value="1">默认触发</a-select-option>
            <a-select-option :value="2">被关注触发</a-select-option>
            <a-select-option :value="3">菜单点击事件</a-select-option>
          </a-select>
        </a-form-item>
        
        <!-- 关键词触发时的匹配值 -->
        <a-form-item 
          v-if="ruleForm.replyType === 0" 
          label="匹配关键字" 
          name="matchValue"
        >
          <div class="match-keywords">
            <div v-for="(match, index) in ruleForm.matchValue" :key="index" class="match-item">
              <a-input
                v-model:value="match.matchKeyWords"
                placeholder="请输入关键字"
                style="width: 200px; margin-right: 8px"
              />
              <a-select
                v-model:value="match.matchType"
                style="width: 120px; margin-right: 8px"
              >
                <a-select-option :value="1">半匹配</a-select-option>
                <a-select-option :value="0">全匹配</a-select-option>
              </a-select>
              <a-button type="text" danger @click="removeMatchKeyword(index)">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </div>
            <a-button type="dashed" @click="addMatchKeyword">
              <template #icon>
                <PlusOutlined />
              </template>
              添加关键字
            </a-button>
          </div>
        </a-form-item>
        
        <!-- 菜单点击事件时的事件Key -->
        <a-form-item 
          v-if="ruleForm.replyType === 3" 
          label="事件Key" 
          name="eventKey"
        >
          <a-input v-model:value="ruleForm.eventKey" placeholder="请输入菜单事件Key" />
        </a-form-item>
        
        <a-form-item label="回复类型" name="contentType">
          <a-select v-model:value="ruleForm.replyContent.contentType" @change="handleContentTypeChange">
            <a-select-option :value="0">文本消息</a-select-option>
            <a-select-option :value="1">图片消息</a-select-option>
            <a-select-option :value="2">音频消息</a-select-option>
            <a-select-option :value="3">视频消息</a-select-option>
            <a-select-option :value="4">图文消息</a-select-option>
          </a-select>
        </a-form-item>
        
        <!-- 文本消息内容 -->
        <a-form-item 
          v-if="ruleForm.replyContent.contentType === 0" 
          label="回复内容" 
          name="textContent"
        >
          <a-textarea 
            v-model:value="ruleForm.replyContent.textContent" 
            :rows="4"
            placeholder="请输入回复内容"
          />
        </a-form-item>
        
        <!-- 媒体文件选择 -->
        <a-form-item 
          v-if="[1, 2, 3].includes(ruleForm.replyContent.contentType)" 
          label="媒体文件" 
          name="mediaId"
        >
          <div class="media-selector">
            <a-input
              v-model:value="ruleForm.replyContent.mediaId"
              placeholder="请输入媒体文件ID"
              style="margin-bottom: 8px"
            />
            <a-button type="primary" @click="showMaterialSelector">
              <template #icon>
                <FileSearchOutlined />
              </template>
              选择素材
            </a-button>
          </div>
        </a-form-item>
        
        <!-- 图文消息 -->
        <a-form-item 
          v-if="ruleForm.replyContent.contentType === 4" 
          label="图文消息ID" 
          name="articleId"
        >
          <a-input 
            v-model:value="ruleForm.replyContent.articleId" 
            placeholder="请输入图文消息ID"
          />
        </a-form-item>
        
        <a-form-item label="规则描述" name="ruleDescription">
          <a-textarea 
            v-model:value="ruleForm.ruleDescription" 
            :rows="2"
            placeholder="请输入规则描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 素材选择器模态框 -->
    <a-modal
      v-model:open="materialSelectorVisible"
      title="选择素材"
      @ok="handleMaterialSelectOk"
      @cancel="materialSelectorVisible = false"
      :confirm-loading="materialLoading"
      width="800px"
    >
      <div class="material-selector-content">
        <!-- 素材类型选择 -->
        <div class="material-type-selector" style="margin-bottom: 16px">
          <a-radio-group v-model:value="materialType" @change="handleMaterialTypeChange">
            <a-radio-button value="image">图片</a-radio-button>
            <a-radio-button value="voice">音频</a-radio-button>
            <a-radio-button value="video">视频</a-radio-button>
          </a-radio-group>
        </div>
        
        <!-- 素材列表 -->
        <div class="material-grid">
          <a-spin :spinning="materialLoading">
            <div v-if="materialList.length === 0" class="empty-material">
              <a-empty description="暂无素材" />
            </div>
            <div v-else class="grid-container">
              <div
                v-for="material in materialList"
                :key="material.mediaId"
                class="material-item"
                :class="{ selected: selectedMaterial?.mediaId === material.mediaId }"
                @click="selectMaterial(material)"
              >
                <div class="material-preview">
                  <img
                    v-if="materialType === 'image' && material.url"
                    :src="getMaterialImageUrl(material)"
                    :alt="material.name"
                    @error="handleMaterialImageError"
                     referrerPolicy="no-referrer"
                  />
                  <div v-else class="default-preview">
                    <span>{{ getMaterialTypeText() }}</span>
                  </div>
                </div>
                <div class="material-info">
                  <div class="material-name">{{ material.name }}</div>
                  <div class="material-time">{{ formatDate(material.updateTime) }}</div>
                </div>
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="material-pagination">
              <a-pagination
                v-model:current="materialPage.current"
                v-model:page-size="materialPage.pageSize"
                :total="materialPage.total"
                :show-size-changer="false"
                :show-quick-jumper="true"
                :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
                @change="handleMaterialPageChange"
              />
            </div>
          </a-spin>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, DeleteOutlined, FileSearchOutlined } from '@ant-design/icons-vue'
import type { WxAccountVO } from '@/types'
import { listWxAccountByPage } from '@/api/wxAccount'
import { 
  addReplyRule, 
  getReplyRule, 
  listReplyRules, 
  updateReplyRule, 
  deleteReplyRule 
} from '@/api/wxReplyRule'
import { listMaterial } from '@/api/wxMaterial'
import type { 
  WxReplyRuleAddRequest, 
  WxReplyRuleUpdateRequest, 
  WxReplyRulePageQueryRequest, 
  WxReplyRuleVO 
} from '@/api/wxReplyRule'
import type { WxMaterialFileBatchGetNewsItem } from '@/types'

// 公众号列表
const accountList = ref<WxAccountVO[]>([])
const selectedAppId = ref<string>('')

// 规则列表
const ruleList = ref<WxReplyRuleVO[]>([])
const loading = ref(false)

// 素材选择器相关
const materialSelectorVisible = ref(false)
const materialLoading = ref(false)
const materialList = ref<WxMaterialFileBatchGetNewsItem[]>([])
const selectedMaterial = ref<WxMaterialFileBatchGetNewsItem | null>(null)
const materialType = ref<string>('image')
const materialPage = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 搜索表单
const searchForm = reactive<WxReplyRulePageQueryRequest>({
  current: 1,
  pageSize: 10,
  ruleName: '',
  replyType: undefined
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`
})

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    key: 'ruleName'
  },
  {
    title: '回复类型',
    key: 'replyType',
    width: 120
  },
  {
    title: '匹配关键字',
    key: 'matchValue',
    width: 200
  },
  {
    title: '回复内容',
    key: 'replyContent',
    ellipsis: true
  },
  {
    title: '规则描述',
    dataIndex: 'ruleDescription',
    key: 'ruleDescription',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 模态框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 规则表单
const ruleForm = reactive({
  id: 0,
  appId: '',
  ruleName: '',
  matchValue: [{ matchType: 0, matchKeyWords: '' }],
  eventKey: '',
  replyContent: {
    contentType: 0,
    articleId: '',
    mediaId: '',
    textContent: ''
  },
  ruleDescription: '',
  replyType: 0
})

// 表单验证规则
const ruleFormRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  replyType: [
    { required: true, message: '请选择回复类型', trigger: 'change' }
  ],
  'replyContent.contentType': [
    { required: true, message: '请选择回复内容类型', trigger: 'change' }
  ]
}

// 获取回复类型颜色
const getReplyTypeColor = (type: number) => {
  const colorMap: Record<number, string> = {
    0: 'blue',
    1: 'green',
    2: 'orange',
    3: 'purple'
  }
  return colorMap[type] || 'default'
}

// 获取回复类型文本
const getReplyTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    0: '关键词触发',
    1: '默认触发',
    2: '被关注触发',
    3: '菜单点击事件'
  }
  return textMap[type] || '未知'
}

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
  pagination.current = 1
  getRuleList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getRuleList()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  getRuleList()
}

// 获取规则列表
const getRuleList = async () => {
  if (!selectedAppId.value) {
    ruleList.value = []
    pagination.total = 0
    return
  }
  
  loading.value = true
  try {
    searchForm.appId = selectedAppId.value
    searchForm.current = pagination.current
    searchForm.pageSize = pagination.pageSize
    
    const response = await listReplyRules(selectedAppId.value, searchForm)
    if (response.code === 0 && response.data) {
      ruleList.value = response.data.records || []
      pagination.current = response.data.pageNumber
      pagination.pageSize = response.data.pageSize
      pagination.total = response.data.totalRow
    }
  } catch (error) {
    console.error('获取规则列表失败:', error)
    ruleList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

// 显示编辑模态框
const showEditModal = (record: any) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(ruleForm, record)
}

// 重置表单
const resetForm = () => {
  Object.assign(ruleForm, {
    id: 0,
    appId: selectedAppId.value,
    ruleName: '',
    matchValue: [{ matchType: 0, matchKeyWords: '' }],
    eventKey: '',
    replyContent: {
      contentType: 0,
      articleId: '',
      mediaId: '',
      textContent: ''
    },
    ruleDescription: '',
    replyType: 0
  })
}

// 添加匹配关键字
const addMatchKeyword = () => {
  ruleForm.matchValue.push({ matchType: 0, matchKeyWords: '' })
}

// 删除匹配关键字
const removeMatchKeyword = (index: number) => {
  ruleForm.matchValue.splice(index, 1)
}

// 回复类型变化处理
const handleReplyTypeChange = () => {
  // 根据回复类型重置相关字段
  if (ruleForm.replyType !== 0) {
    ruleForm.matchValue = []
  }
  if (ruleForm.replyType !== 3) {
    ruleForm.eventKey = ''
  }
}

// 内容类型变化处理
const handleContentTypeChange = () => {
  // 根据内容类型重置相关字段
  ruleForm.replyContent.articleId = ''
  ruleForm.replyContent.mediaId = ''
  ruleForm.replyContent.textContent = ''
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true
    
    let response
    if (isEdit.value) {
      response = await updateReplyRule(ruleForm as WxReplyRuleUpdateRequest)
    } else {
      response = await addReplyRule(ruleForm as WxReplyRuleAddRequest)
    }
    
    if (response.code === 0) {
      message.success(isEdit.value ? '更新成功' : '添加成功')
      modalVisible.value = false
      getRuleList()
    }
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    modalLoading.value = false
  }
}

// 模态框取消
const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 删除规则
const handleDelete = async (id: number) => {
  try {
    const response = await deleteReplyRule(id)
    if (response.code === 0) {
      message.success('删除成功')
      getRuleList()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 显示素材选择器
const showMaterialSelector = () => {
  materialSelectorVisible.value = true
  materialPage.current = 1
  getMaterialList()
}

// 获取素材列表
const getMaterialList = async () => {
  if (!selectedAppId.value) return
  
  materialLoading.value = true
  try {
    const query = {
      materialType: materialType.value,
      current: materialPage.current,
      pageSize: materialPage.pageSize
    }
    
    const response = await listMaterial(selectedAppId.value, query)
    if (response.code === 0 && response.data) {
      materialList.value = response.data.items || []
      materialPage.total = response.data.totalCount
    }
  } catch (error) {
    console.error('获取素材列表失败:', error)
    materialList.value = []
  } finally {
    materialLoading.value = false
  }
}

// 素材类型变化处理
const handleMaterialTypeChange = () => {
  materialPage.current = 1
  selectedMaterial.value = null
  getMaterialList()
}

// 素材分页变化处理
const handleMaterialPageChange = (page: number) => {
  materialPage.current = page
  getMaterialList()
}

// 选择素材
const selectMaterial = (material: WxMaterialFileBatchGetNewsItem) => {
  selectedMaterial.value = material
}

// 素材选择确认
const handleMaterialSelectOk = () => {
  if (selectedMaterial.value) {
    ruleForm.replyContent.mediaId = selectedMaterial.value.mediaId
    materialSelectorVisible.value = false
  }
}

// 获取素材图片URL
const getMaterialImageUrl = (material: WxMaterialFileBatchGetNewsItem) => {
  if (!material.url) return ''
  
  if (material.url.startsWith('http')) {
    return material.url
  }
  
  const baseUrl = 'http://localhost:8866'
  return `${baseUrl}${material.url.startsWith('/') ? '' : '/'}${material.url}`
}

// 处理素材图片加载错误
const handleMaterialImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
    const parent = img.parentElement
    if (parent) {
      const defaultDiv = document.createElement('div')
      defaultDiv.className = 'default-preview'
      defaultDiv.innerHTML = '<span>图片加载失败</span>'
      parent.appendChild(defaultDiv)
    }
  }
}

// 获取素材类型文本
const getMaterialTypeText = () => {
  const textMap: Record<string, string> = {
    image: '图片',
    voice: '音频',
    video: '视频'
  }
  return textMap[materialType.value] || '素材'
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
.wx-reply-rule-manage {
  padding: 20px;
}

.empty-tip {
  padding: 50px 0;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.match-keywords {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.match-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.match-item:last-child {
  margin-bottom: 0;
}

.reply-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-selector {
  width: 100%;
}

.material-selector-content {
  max-height: 500px;
  overflow-y: auto;
}

.material-type-selector {
  text-align: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.material-item {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.material-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.material-item.selected {
  border-color: #1890ff;
  background-color: #f6ffed;
}

.material-preview {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.material-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.material-info {
  text-align: center;
}

.material-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-time {
  font-size: 10px;
  color: #999;
}

.empty-material {
  text-align: center;
  padding: 50px 0;
}

.material-pagination {
  text-align: center;
  margin-top: 16px;
}
</style>