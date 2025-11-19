<template>
  <div class="wx-account-manage">
    <a-card title="公众号管理">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <template #icon>
            <PlusOutlined />
          </template>
          添加公众号
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item label="公众号名称">
            <a-input v-model:value="searchForm.name" placeholder="请输入公众号名称" />
          </a-form-item>
          <a-form-item label="AppID">
            <a-input v-model:value="searchForm.appId" placeholder="请输入AppID" />
          </a-form-item>
          <a-form-item label="认证状态">
            <a-select
              v-model:value="searchForm.verified"
              placeholder="请选择认证状态"
              style="width: 120px"
              allow-clear
            >
              <a-select-option :value="true">已认证</a-select-option>
              <a-select-option :value="false">未认证</a-select-option>
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
        :data-source="accountList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'verified'">
            <a-tag :color="record.verified ? 'green' : 'orange'">
              {{ record.verified ? '已认证' : '未认证' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'user'">
            <a-space>
              <a-avatar :src="record.user?.userAvatar" :alt="record.user?.userName">
                {{ record.user?.userName?.charAt(0) }}
              </a-avatar>
              <span>{{ record.user?.userName }}</span>
            </a-space>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleGetAccessToken(record.appId)">
                获取Token
              </a-button>
              <a-popconfirm
                title="确定要删除这个公众号吗？"
                @confirm="handleDelete(record.appId)"
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
    </a-card>
    
    <!-- 添加/编辑公众号模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑公众号' : '添加公众号'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="accountForm"
        :rules="accountFormRules"
        layout="vertical"
      >
        <a-form-item label="AppID" name="appId">
          <a-input v-model:value="accountForm.appId" placeholder="请输入公众号AppID" />
        </a-form-item>
        <a-form-item label="公众号名称" name="name">
          <a-input v-model:value="accountForm.name" placeholder="请输入公众号名称" />
        </a-form-item>
        <a-form-item label="AppSecret" name="secret">
          <a-input-password v-model:value="accountForm.secret" placeholder="请输入AppSecret" />
        </a-form-item>
        <a-form-item label="Token" name="token">
          <a-input v-model:value="accountForm.token" placeholder="请输入Token" />
        </a-form-item>
        <a-form-item label="AESKey" name="aesKey">
          <a-input v-model:value="accountForm.aesKey" placeholder="请输入消息加解密密钥" />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- Token显示模态框 -->
    <a-modal
      v-model:open="tokenModalVisible"
      title="Access Token"
      @ok="tokenModalVisible = false"
      :footer="null"
    >
      <a-input :value="accessToken" readonly>
        <template #suffix>
          <a-button type="link" size="small" @click="copyToken">
            <template #icon>
              <CopyOutlined />
            </template>
            复制
          </a-button>
        </template>
      </a-input>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons-vue'
import type { WxAccountVO, WxAccountPageQueryDTO, WxAccountAddDTO, WxAccountUpdateDTO } from '@/types'
import { listWxAccountByPage, addWxAccount, updateWxAccount, deleteWxAccounts, getAccessToken } from '@/api/wxAccount'

// 搜索表单
const searchForm = reactive<WxAccountPageQueryDTO>({
  name: '',
  appId: '',
  verified: undefined,
  current: 1,
  pageSize: 10
})

// 公众号列表
const accountList = ref<WxAccountVO[]>([])
const loading = ref(false)

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
    title: 'AppID',
    dataIndex: 'appId',
    key: 'appId',
    width: 200,
    ellipsis: true
  },
  {
    title: '公众号名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '认证状态',
    key: 'verified',
    width: 100
  },
  {
    title: '所属用户',
    key: 'user',
    width: 150
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
    width: 200,
    fixed: 'right'
  }
]

// 模态框相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

// Token模态框
const tokenModalVisible = ref(false)
const accessToken = ref('')

// 公众号表单
const accountForm = reactive<WxAccountAddDTO & WxAccountUpdateDTO>({
  id: 0,
  appId: '',
  name: '',
  secret: '',
  token: '',
  aesKey: ''
})

// 表单验证规则
const accountFormRules = {
  appId: [
    { required: true, message: '请输入AppID', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入公众号名称', trigger: 'blur' }
  ],
  secret: [
    { required: true, message: '请输入AppSecret', trigger: 'blur' }
  ],
  token: [
    { required: true, message: '请输入Token', trigger: 'blur' }
  ],
  aesKey: [
    { required: true, message: '请输入AESKey', trigger: 'blur' }
  ]
}

// 获取公众号列表
const getAccountList = async () => {
  loading.value = true
  try {
    const response = await listWxAccountByPage(searchForm)
    if (response.code === 0 && response.data) {
      accountList.value = response.data.records
      pagination.current = response.data.pageNumber
      pagination.pageSize = response.data.pageSize
      pagination.total = response.data.totalRow
    }
  } catch (error) {
    console.error('获取公众号列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.current = 1
  getAccountList()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  searchForm.current = pag.current
  searchForm.pageSize = pag.pageSize
  getAccountList()
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

// 显示编辑模态框
const showEditModal = (record: WxAccountVO) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(accountForm, record)
}

// 重置表单
const resetForm = () => {
  Object.assign(accountForm, {
    id: 0,
    appId: '',
    name: '',
    secret: '',
    token: '',
    aesKey: ''
  })
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true
    
    let response
    if (isEdit.value) {
      response = await updateWxAccount(accountForm as WxAccountUpdateDTO)
    } else {
      response = await addWxAccount(accountForm as WxAccountAddDTO)
    }
    
    if (response.code === 0) {
      message.success(isEdit.value ? '更新成功' : '添加成功')
      modalVisible.value = false
      getAccountList()
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

// 删除公众号
const handleDelete = async (appId: string) => {
  try {
    const response = await deleteWxAccounts([appId])
    if (response.code === 0) {
      message.success('删除成功')
      getAccountList()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 获取Access Token
const handleGetAccessToken = async (appId: string) => {
  try {
    const response = await getAccessToken(appId)
    if (response.code === 0 && response.data) {
      accessToken.value = response.data
      tokenModalVisible.value = true
    }
  } catch (error) {
    console.error('获取Access Token失败:', error)
  }
}

// 复制Token
const copyToken = () => {
  navigator.clipboard.writeText(accessToken.value).then(() => {
    message.success('复制成功')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 初始化
onMounted(() => {
  getAccountList()
})
</script>

<style scoped>
.wx-account-manage {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}
</style>