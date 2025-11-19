<template>
  <div class="user-manage">
    <a-card title="用户管理">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <template #icon>
            <PlusOutlined />
          </template>
          添加用户
        </a-button>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item label="用户账号">
            <a-input v-model:value="searchForm.userAccount" placeholder="请输入用户账号" />
          </a-form-item>
          <a-form-item label="用户昵称">
            <a-input v-model:value="searchForm.userName" placeholder="请输入用户昵称" />
          </a-form-item>
          <a-form-item label="用户角色">
            <a-select
              v-model:value="searchForm.userRole"
              placeholder="请选择用户角色"
              style="width: 120px"
              allow-clear
            >
              <a-select-option value="user">普通用户</a-select-option>
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="ban">被封禁</a-select-option>
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
        :data-source="userList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userRole'">
            <a-tag :color="getRoleColor(record.userRole)">
              {{ getRoleText(record.userRole) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'userAvatar'">
            <a-avatar :src="record.userAvatar" :alt="record.userName">
              {{ record.userName?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个用户吗？"
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
    </a-card>
    
    <!-- 添加/编辑用户模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
    >
      <a-form
        ref="formRef"
        :model="userForm"
        :rules="userFormRules"
        layout="vertical"
      >
        <a-form-item label="用户账号" name="userAccount">
          <a-input v-model:value="userForm.userAccount" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="用户昵称" name="userName">
          <a-input v-model:value="userForm.userName" />
        </a-form-item>
        <a-form-item label="用户头像" name="userAvatar">
          <a-input v-model:value="userForm.userAvatar" placeholder="请输入头像URL" />
        </a-form-item>
        <a-form-item label="用户简介" name="userProfile">
          <a-textarea v-model:value="userForm.userProfile" :rows="3" />
        </a-form-item>
        <a-form-item label="用户角色" name="userRole">
          <a-select v-model:value="userForm.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { UserVO, UserQueryRequest, UserAddRequest, UserUpdateRequest } from '@/types'
import { listUserByPage, addUser, updateUser, deleteUser } from '@/api/user'

// 搜索表单
const searchForm = reactive<UserQueryRequest>({
  userAccount: '',
  userName: '',
  userRole: undefined,
  current: 1,
  pageSize: 10
})

// 用户列表
const userList = ref<UserVO[]>([])
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
    title: '头像',
    key: 'userAvatar',
    width: 80
  },
  {
    title: '用户账号',
    dataIndex: 'userAccount',
    key: 'userAccount'
  },
  {
    title: '用户昵称',
    dataIndex: 'userName',
    key: 'userName'
  },
  {
    title: '用户角色',
    key: 'userRole',
    width: 100
  },
  {
    title: '用户简介',
    dataIndex: 'userProfile',
    key: 'userProfile',
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

// 用户表单
const userForm = reactive<UserAddRequest & UserUpdateRequest>({
  id: 0,
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user'
})

// 表单验证规则
const userFormRules = {
  userAccount: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 4, message: '账号长度不能少于4位', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' }
  ],
  userRole: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
}

// 获取角色颜色
const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    admin: 'red',
    user: 'blue',
    ban: 'gray'
  }
  return colorMap[role] || 'default'
}

// 获取角色文本
const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
    ban: '被封禁'
  }
  return textMap[role] || role
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const response = await listUserByPage(searchForm)
    if (response.code === 0 && response.data) {
      userList.value = response.data.records
      pagination.current = response.data.pageNumber
      pagination.pageSize = response.data.pageSize
      pagination.total = response.data.totalRow
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.current = 1
  getUserList()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  searchForm.current = pag.current
  searchForm.pageSize = pag.pageSize
  getUserList()
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

// 显示编辑模态框
const showEditModal = (record: UserVO) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(userForm, record)
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    id: 0,
    userAccount: '',
    userName: '',
    userAvatar: '',
    userProfile: '',
    userRole: 'user'
  })
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true
    
    let response
    if (isEdit.value) {
      response = await updateUser(userForm as UserUpdateRequest)
    } else {
      response = await addUser(userForm as UserAddRequest)
    }
    
    if (response.code === 0) {
      message.success(isEdit.value ? '更新成功' : '添加成功')
      modalVisible.value = false
      getUserList()
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

// 删除用户
const handleDelete = async (id: number) => {
  try {
    const response = await deleteUser({ id })
    if (response.code === 0) {
      message.success('删除成功')
      getUserList()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 初始化
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}
</style>