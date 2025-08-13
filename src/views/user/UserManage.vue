<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {Delete, Edit, Plus, Connection, Refresh, Search} from '@element-plus/icons-vue';
import {
  type Permission,
  PermissionAPI,
  type PermissionNodes,
  type PermissionQueryForm,
  type Role,
  RoleAPI,
  type RoleQueryForm, UserRoleAPI
} from '@/api/role';
import AuthAPI, {type User, type UserQueryForm} from "@/api/auth";
import {Connect} from "vite";
import {ElTree} from "element-plus";
import {c} from "vite/dist/node/types.d-aGj9QkWt";

// 定义类型
interface UserUpdateParams {
  phone: string;
  status: number;
}

// 用户列表
const userList = ref<User[]>([]);
const userQueryForm = ref<UserQueryForm>({
  page: 1,
  size: 20
});
const totalUser = ref<number>(0);

// 角色列表
const roleList = ref<Role[]>([]);
const roleQueryForm = ref<RoleQueryForm>({
  page: 1,
  size: 20
});
const totalRole = ref<number>(0);

// 选中的数据
const selectedUser = ref<User>();

const handleRowClick = (row: any) => {
  selectedUser.value = row;
};

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await AuthAPI.getUserList(userQueryForm.value);
    userList.value = res.items;
    totalUser.value = res.total;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  }
};

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await RoleAPI.getRoleList(roleQueryForm.value);
    roleList.value = res.items;
    totalRole.value = res.total;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
  }
};

// 获取权限树
// 定义树的配置项
const defaultProps = {
  id: 'id',
  label: 'name',
  children: 'children'
};

// 定义树的 ref
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

const defaultChecked = () => {
  nextTick(() => {
    if (treeRef.value && dialogForm.value) {
      const arr: number[] = [];
      currentCheckedKeys.value.forEach((key) => {
        const node = treeRef.value!.getNode(key);
        if (node.isLeaf) {
          arr.push(key);
        }
      })
      treeRef.value.setCheckedKeys(arr);
    }
  });
};

// 分页器操作
const handleSizeChange = (val: number) => {
  userQueryForm.value.size = val;
  getUserList();
};

const handleCurrentChange = (val: number) => {
  userQueryForm.value.page = val;
  getUserList();
};

// 重置查询表单
const handleReset = async () => {
  userQueryForm.value = {
    page: 1,
    size: 20
  };
  await getUserList();
};

// 查询角色/用户/权限
const handleSearch = () => {
  getUserList();
};

// 删除用户
const deleteUser = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await AuthAPI.deleteUser(row.id);
    await getUserList();
    ElMessage.success('删除用户成功');
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除操作，不做处理
    } else {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败，请稍后重试');
    }
  }
};


const deviceFormRef = ref(null); // 添加表单ref
// 校验名称
const validateName = (rule: any, value: any, callback: (error?: string | Error) => void) => {
  console.log(value)
  if (!value || value.trim() === '') {
    callback(new Error('该项不能为空'));
  } else {
    callback();
  }
};

// 校验手机号（手机号可以为空）
const validatePhone = (rule: any, value: any, callback: (error?: string | Error) => void) => {
  if (!value) {
    // 如果手机号为空，直接通过校验
    callback();
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    // 如果手机号不为空，但格式不正确，则返回错误提示
    callback(new Error('请输入正确的手机号'));
  } else {
    // 如果手机号格式正确，通过校验
    callback();
  }
};

// 表单校验规则
const formRules = {
  username: [{validator: validateName, trigger: 'blur'}],
  phone: [{validator: validatePhone, trigger: 'blur'}],
};


// 对话框相关
const dialogVisible = ref<boolean>(false);
const dialogTitle = ref<string>('');
const formMode = ref<string>('add'); // 'add' 或 'edit'
const dialogForm = ref<User | Role | Permission>();
const currentRoleIds = ref<number[]>([]);

// 打开添加对话框
const openAddDialog = () => {
  formMode.value = 'add';
  currentRoleIds.value = [];
  dialogTitle.value = '新增用户';
  dialogForm.value = {} as Role | User | Permission;
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row: User | Role | Permission) => {
  formMode.value = 'edit';
  dialogTitle.value = '编辑用户信息';
  dialogForm.value = {...row};
  if (dialogForm.value) {
    currentRoleIds.value = roleList.value
        .filter(item => dialogForm.value.roles.includes(item.name))
        .map(item => item.id);
  }
  dialogVisible.value = true;
};

// 用户角色分配
const handleUserRolesAssign = async (userId: number, roleIds: number[]) => {
  if (userId) {
    try {
      await UserRoleAPI.assignUserRoles(userId, roleIds);
      ElMessage.success('角色分配成功');
    } catch (error) {
      console.error('角色分配失败:', error);
      ElMessage.error('角色分配失败，请稍后重试');
      throw error;
    }
  }
}

// 提交表单
const submitForm = async () => {
  // 先进行表单验证
  if (!deviceFormRef.value) {
    console.error('deviceFormRef is null');
    return;
  }
  try {
    // 等待表单验证完成，如果验证失败直接返回
    // await deviceFormRef.value.validate();
    // console.log('表单验证失败');
  } catch (error) {
    // 表单验证失败，直接返回
    return;
  }
  if (formMode.value === 'add') {
    try {
      await AuthAPI.createUser(dialogForm.value as User);
      ElMessage.success('新增用户成功');
      await getUserList();
    } catch (error) {
      console.error('新增用户失败:', error);
      ElMessage.error('新增用户失败，请稍后重试');
    }
  } else if (formMode.value === 'edit') {

    const updateParams: UserUpdateParams = {
      phone: (dialogForm.value as User).phone,
      password: (dialogForm.value as User).password,
      status: (dialogForm.value as User).status
    };
    try {
      await handleUserRolesAssign((dialogForm.value as User).id, currentRoleIds.value);
      await AuthAPI.updateUser((dialogForm.value as User).id, updateParams);
      ElMessage.success('编辑用户成功');
      await getUserList();
    } catch (error) {
      console.error('编辑用户失败:', error);
      ElMessage.error('编辑用户失败，请稍后重试');
    }
  }
  dialogVisible.value = false;
};

// 重置表单
const resetForm = () => {
  currentRoleIds.value = [];
}

// 对权限进行分组
const filterPermissionTree = (permissions: string[], tree: PermissionNodes[]): PermissionNodes[] => {
  // 深拷贝树数据，避免修改原始数据
  const copiedTree = JSON.parse(JSON.stringify(tree));
  return copiedTree.filter(node => {
    // 检查当前节点是否在权限列表中
    const isNodeIncluded = permissions.includes(node.name);
    // 递归过滤子节点
    if (node.children) {
      node.children = filterPermissionTree(permissions, node.children);
    }
    // 若当前节点在列表中或有符合条件的子节点，则保留该节点
    return isNodeIncluded || (node.children && node.children.length > 0);
  });
};

onMounted(async () => {
  await getRoleList();
  await getUserList();
});
</script>

<template>
  <div class="content-container">
    <template class="center-panel">
      <!-- 搜索区域与操作按钮 -->
      <el-form :model="userQueryForm" class="search-bar">
        <!--              <el-form-item label="用户名" prop="username">-->
        <!--                <el-input v-model="userQueryForm.username" placeholder="请输入用户名" clearable/>-->
        <!--              </el-form-item>-->
        <!--              <el-form-item label="角色" prop="role_id">-->
        <!--                <el-select-->
        <!--                    v-model="userQueryForm.role_id"-->
        <!--                    placeholder="请选择角色"-->
        <!--                    clearable-->
        <!--                >-->
        <!--                  <el-option-->
        <!--                      v-for="role in roleList"-->
        <!--                      :key="role.id"-->
        <!--                      :label="role.name"-->
        <!--                      :value="role.id"-->
        <!--                  />-->
        <!--                </el-select>-->
        <!--              </el-form-item>-->
        <div class="action-buttons">
          <!--                <el-button @click="handleSearch" :icon="Search" type="primary">搜索</el-button>-->
          <!--                <el-button @click="handleReset" :icon="Refresh">重置</el-button>-->
          <el-button @click="openAddDialog" :icon="Plus" type="primary">新增</el-button>
        </div>
      </el-form>
      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
            :data="userList"
            style="width: 100%; height: 100%;"
            @row-click="handleRowClick"
            highlight-current-row
            height="100vh"
        >
          <el-table-column prop="id" label="用户ID" align="center"/>
          <el-table-column prop="username" label="用户名" align="center"/>
          <el-table-column prop="phone" label="手机号" align="center"/>
          <el-table-column prop="roles" label="角色名称" align="center">
            <template #default="scope">
              <span v-if="scope.row.roles.length" class="role-tag">{{ scope.row.roles.join(',') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
             <span :class="['status-tag', scope.row.status === 1 ? 'active' : 'disabled']">
                {{ scope.row.status === 1 ? '正常' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button
                    type="primary"
                    :icon="Edit"
                    size="small"
                    @click.stop="openEditDialog(scope.row)"
                >编辑
                </el-button>
                <el-button
                    type="danger"
                    :icon="Delete"
                    size="small"
                    @click.stop="deleteUser(scope.row)"
                >删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-box">
        <el-pagination
            v-model:current-page="userQueryForm.page"
            v-model:page-size="userQueryForm.size"
            :total="totalUser"
            :page-sizes="[10, 20, 50]"
            layout="sizes, prev, pager, next"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </template>
    <!-- 右侧详情页 -->
    <template class="right-panel">
      <template v-if="selectedUser">
        <div class="detail-container">
          <div class="panel-title">用户详情</div>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">用户ID:</span>
              <span class="detail-value">{{ selectedUser?.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用户名:</span>
              <span class="detail-value">{{ selectedUser?.username }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">角色名称:</span>
              <span class="detail-value">{{ selectedUser?.roles?.map(role => role).join(', ') || '无' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态:</span>
              <!-- 根据状态值显示对应的文字 -->
              <span class="detail-value">{{
                  selectedUser?.status === 1 ? '正常' : selectedUser?.status === 0 ? '禁用' : '未知'
                }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ selectedUser?.create_time?.replace('T', ' ') }}</span>
            </div>
          </div>
        </div>
      </template>
      <!--      <template v-if="currentMenu === 2 && selectedRole">-->
      <!--        <div class="container detail-container">-->
      <!--          <div class="panel-title">-->
      <!--            角色详情-->
      <!--          </div>-->
      <!--          <div class="detail-content">-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">角色ID:</span>-->
      <!--              <span class="detail-value">{{ selectedRole?.id }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">角色名称:</span>-->
      <!--              <span class="detail-value">{{ selectedRole?.name }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">状态:</span>-->
      <!--              &lt;!&ndash; 根据状态值显示对应的文字 &ndash;&gt;-->
      <!--              <span class="detail-value">{{-->
      <!--                  selectedRole?.status === 1 ? '正常' : selectedRole?.status === 0 ? '禁用' : '未知'-->
      <!--                }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">角色描述:</span>-->
      <!--              <span class="detail-value">{{ selectedRole?.description }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">角色权限:</span>-->
      <!--              <span class="detail-value">-->
      <!--                <template v-if="groupedPermissions.length">-->
      <!--                  <div class="permission-tree">-->
      <!--                    <div v-for="node in groupedPermissions" :key="node.id" class="permission-node">-->
      <!--                      <div class="permission-node-name">{{ node.name }}</div>-->
      <!--                      <div v-if="node.children" class="permission-children">-->
      <!--                        <span v-for="child in node.children" :key="child.id" class="permission-child">-->
      <!--                          {{ child.name }}-->
      <!--                        </span>-->
      <!--                      </div>-->
      <!--                    </div>-->
      <!--                  </div>-->
      <!--                </template>-->
      <!--                <template v-else>无</template>-->
      <!--              </span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">创建时间:</span>-->
      <!--              <span class="detail-value">{{ selectedRole?.create_time?.replace('T', ' ') }}</span>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </template>-->
      <!--      <template v-if="currentMenu === 3 && selectedPermission">-->
      <!--        <div class="container detail-container">-->
      <!--          <div class="panel-title">权限详情</div>-->
      <!--          <div class="detail-content">-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">权限ID:</span>-->
      <!--              <span class="detail-value">{{ selectedPermission?.id }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">权限名称:</span>-->
      <!--              <span class="detail-value">{{ selectedPermission?.name }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">权限标识符:</span>-->
      <!--              <span class="detail-value">{{ selectedPermission?.code }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">状态:</span>-->
      <!--              &lt;!&ndash; 根据状态值显示对应的文字 &ndash;&gt;-->
      <!--              <span class="detail-value">{{-->
      <!--                  selectedPermission?.status === 1 ? '正常' : selectedPermission?.status === 0 ? '禁用' : '未知'-->
      <!--                }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">权限类型:</span>-->
      <!--              &lt;!&ndash; 根据状态值显示对应的文字 &ndash;&gt;-->
      <!--              <span class="detail-value">{{-->
      <!--                  selectedPermission?.type === 1 ? '菜单' : selectedPermission?.type === 2 ? '按钮' : '未知'-->
      <!--                }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">创建时间:</span>-->
      <!--              <span class="detail-value">{{ selectedPermission?.create_time?.replace('T', ' ') }}</span>-->
      <!--            </div>-->
      <!--            <div class="detail-item">-->
      <!--              <span class="detail-label">备注:</span>-->
      <!--              <span class="detail-value">{{ selectedPermission?.remark }}</span>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </template>-->
      <template v-if="!selectedRole && !selectedUser && !selectedPermission">
        <div class="container detail-container">
          <div class="panel-title">详情</div>
          <div class="no-data">
            <p>请选择左侧表格中的一行数据查看详情</p>
          </div>
        </div>
      </template>
    </template>
    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @close="resetForm"
    >
      <el-form :model="dialogForm" ref="deviceFormRef" :rules="formRules" label-width="100px" class="dialog-form">
        <el-form-item label="用户名" prop="name" style="width: 300px">
          <el-input v-if="formMode === 'add'" v-model="dialogForm.username"/>
          <span v-else>{{ dialogForm.username }}</span>
        </el-form-item>
        <el-form-item label="密码" style="width: 300px">
          <el-input v-model="dialogForm.password" placeholder="若需修改则填写"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" style="width: 300px">
          <el-input v-model="dialogForm.phone" placeholder="请输入正确的手机号"/>
        </el-form-item>
        <el-form-item v-if="formMode === 'edit'" label="状态" prop="status" style="width: 300px">
          <el-select
              v-model="dialogForm.status"
              placeholder="请选择用户状态"
          >
            <!-- 修改选项为禁用和正常 -->
            <el-option
                key="0"
                label="禁用"
                :value=0
            />
            <el-option
                key="1"
                label="正常"
                :value=1
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formMode==='edit'" label="角色" prop="roles" style="width: 300px">
          <el-select
              v-model="currentRoleIds"
              placeholder="请选择用户角色"
              multiple
              filterable
              allow-create
              default-first-option
              clearable
          >
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false" class="custom-button cancel-button">取消</el-button>
        <el-button @click="submitForm" class="custom-button confirm-button">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.content-container {
  width: calc(100% - 20px);
  // margin: 10px 10px 15px 10px;
  height: 100%;
  //height: calc(100vh - $title-height - 30px);
  box-sizing: border-box;
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(77, 179, 255, 0.1);
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  padding: 10px;
  height: 100%;

  .search-bar {
    display: flex;
    justify-content: start;
    align-items: center;
    flex-wrap: wrap;
    padding: 10px;
    background: linear-gradient(90deg, rgba(10, 73, 134, 0.4), rgba(10, 73, 134, 0.2));
    border: 1px dashed rgba(77, 179, 255, 0.3);
    border-radius: 8px;

    .search-item {
      display: flex;
      align-items: center;

      span {
        margin-right: 8px;
        white-space: nowrap;
      }

      input,
      select {
        padding: 6px 10px;
        background-color: rgba(0, 21, 41, 0.6);
        border: 1px solid rgba(77, 179, 255, 0.3);
        color: #fff;
        border-radius: 4px;
        width: 180px;

        &:focus {
          border-color: #4db3ff;
          box-shadow: 0 0 5px rgba(77, 179, 255, 0.3);
        }
      }
    }

    .search-buttons {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }
  }

  .pagination-box {
    height: 40px;
    display: flex;
    justify-content: end;
    align-items: center;
  }
}

.right-panel {
  width: 20vw;
  background-color: rgba(0, 21, 41, 0.4);
  border: 1px dashed rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  margin: 10px 10px 10px 0;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.table-container {
  overflow: hidden;
  flex-grow: 1;
  background-color: rgba(5, 41, 92, 0.2);
  border: 1px dashed rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.role-tag {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.active {
  background-color: #e7ffe6;
  color: #08c428;
}

.status-tag.disabled {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.permission-type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.permission-type-tag.menu {
  background-color: #e6f7ff;
  color: #1890ff;
}

.permission-type-tag.button {
  background-color: #fff7e6;
  color: #faad14;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  gap: 5px;
}

.detail-label {
  width: 80px;
  color: #a0a0a0;
}

.detail-value {
  flex: 1;
}

.permission-tree {
  color: #fff;
}

.permission-node {
  margin-bottom: 10px;
}

.permission-node-name {
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}

.permission-children {
  margin-left: 20px;
}

.permission-child {
  display: inline-block;
  background-color: rgba(77, 179, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.no-data {
  margin: 10px;
  text-align: center;
  color: #a0a0a0;
}

.dialog-form {
  :deep( .el-form-item) {
    margin-bottom: 22px;

    .el-form-item__label {
      color: #222;
      font-size: 15px;
      font-weight: 500;
    }

    .el-input__wrapper, .el-select .el-input__wrapper {
      background: #fff;
      border-radius: 4px;
      color: #222;
      border: 1px solid #e5e6eb;
      box-shadow: none;
    }

    .el-input__inner {
      color: #222;

      &::placeholder {
        color: #bbb;
      }
    }
  }

  :deep(.el-message) {
    z-index: 3000 !important;
    top: 60px !important;
    position: fixed !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin-top: 0 !important;
  }

}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.custom-button {
  padding: 8px 16px;
}

.cancel-button {
  background-color: #f0f2f5;
  color: #606266;
}

.confirm-button {
  background-color: #409eff;
  color: #fff;
}

@media (min-width: 1680px) {
  .content-container {
    height: calc(100vh - $title-height-big - 30px);
  }
}
</style>
