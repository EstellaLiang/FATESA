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
import {ElTree} from "element-plus";

// 定义类型
interface UserUpdateParams {
  phone: string;
  status: number;
}


// 权限列表
const permissionList = ref<Permission[]>([]);
const permissionTreeList = ref<PermissionNodes[]>([]);
const permissionQueryForm = ref<PermissionQueryForm>({
  page: 1,
  size: 20
});
const permissionOptions = ref()
const cascaderProps = {
  emitPath: false
};
const totalPermission = ref<number>(0);

// 选中的数据
const selectedRole = ref<Role>();
const selectedUser = ref<User>();
const selectedPermission = ref<Permission>();

// 分组节点
const groupedPermissions = ref<PermissionNodes[]>([]);
const handleRowClick = (row: any) => {
  selectedPermission.value = row;
};

// 获取权限列表
const getPermissionList = async () => {
  try {
    // 获取权限列表
    const res = await PermissionAPI.getPermissionList(permissionQueryForm.value);
    permissionList.value = res.items;
    totalPermission.value = res.total;
    // 获取权限树
    permissionTreeList.value = await PermissionAPI.getPermissionTree();
    // 初始化权限选项
    // 定义深度筛选函数
    const deepFilter = (nodes: PermissionNodes[]) => {
      const copiedNodes = JSON.parse(JSON.stringify(nodes));
      return copiedNodes.filter(node => {
        if (node.type === 1) {
          if (node.children && node.children.length > 0) {
            node.children = deepFilter(node.children);
          }
          return true;
        }
        return false;
      });
    };
    permissionOptions.value = deepFilter(permissionTreeList.value)
    permissionOptions.value = permissionOptions.value.map((item) => {
      return {
        label: item.name,
        value: item.id,
        children: item.children?.map((child) => {
          return {
            label: child.name,
            value: child.id
          }
        })
      }
    })
  } catch (error) {
    ElMessage.error('获取权限列表失败');
  }
};

// 获取权限树
// 定义树的配置项
const defaultProps = {
  id: 'id',
  label: 'name',
  children: 'children'
};

const currentCheckedKeys = ref<number[]>([]);

// 获取默认选中的节点ID
const getCurrentCheckedKeys = () => {
  if (!dialogForm.value || !permissionTreeList.value) return [];
  const permissions = (dialogForm.value as Role).permissions || [];
  const checkedKeys: number[] = [];

  // 递归函数，用于查找匹配的权限节点
  const findKeys = (nodes: PermissionNodes[]) => {
    nodes.forEach((node) => {
      if (permissions.includes(node.name)) {
        checkedKeys.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        findKeys(node.children);
      }
    });
  };

  findKeys(permissionTreeList.value);
  return checkedKeys;
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
  permissionQueryForm.value.size = val;
  getPermissionList();
};

const handleCurrentChange = (val: number) => {
  permissionQueryForm.value.page = val;
  getPermissionList();
};

// 重置查询表单
const handleReset = async () => {
  permissionQueryForm.value = {
    page: 1,
    size: 20
  };
  await getPermissionList();
};

// 查询角色/用户/权限
const handleSearch = () => {
  getPermissionList();
};

// 删除权限
const deletePermission = async (row: Permission) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await PermissionAPI.deletePermission(row.id);
    await getPermissionList();
    ElMessage.success('删除权限成功');
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除操作，不做处理
    } else {
      console.error('删除权限失败:', error);
      ElMessage.error('删除权限失败，请稍后重试');
    }
  }
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
  dialogTitle.value = '新增权限';
  dialogForm.value = {} as Role | User | Permission;
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row: User | Role | Permission) => {
  formMode.value = 'edit';
  dialogTitle.value = '编辑权限信息';
  dialogForm.value = {...row};
  dialogVisible.value = true;
};

const deviceFormRef = ref(null); // 添加表单ref

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
      await PermissionAPI.createPermission(dialogForm.value as Permission);
      ElMessage.success('新增权限成功');
      await getPermissionList();
    } catch (error) {
      console.error('新增权限失败:', error);
      ElMessage.error('新增权限失败，请稍后重试');
    }
  } else if (formMode.value === 'edit') {
    try {
      await PermissionAPI.updatePermission((dialogForm.value as Permission).id, dialogForm.value as Permission);
      ElMessage.success('编辑权限成功');
      await getPermissionList();
    } catch (error) {
      console.error('编辑权限失败:', error);
      ElMessage.error('编辑权限失败，请稍后重试');
    }
  }
  dialogVisible.value = false;
};

// 重置表单
const resetForm = () => {
  currentCheckedKeys.value = [];
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
  await getPermissionList();
});
</script>

<template>
  <div class="content-container">
    <!-- 权限管理 -->
    <template class="center-panel">
      <!-- 搜索区域与操作按钮 -->
      <el-form :model="permissionQueryForm" class="search-bar">
        <el-form-item label="权限菜单" prop="name">
          <el-cascader v-model="permissionQueryForm.parent_id" :options="permissionOptions" :props="cascaderProps"
                       clearable/>
        </el-form-item>
        <div class="action-buttons">
          <el-button @click="handleSearch" :icon="Search" type="primary">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button @click="openAddDialog" :icon="Plus" type="primary">新增</el-button>
        </div>
      </el-form>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
            :data="permissionList"
            style="width: 100%; height: 100%;"
            @row-click="handleRowClick"
            highlight-current-row
            height="100vh"
        >
          <el-table-column prop="id" label="权限ID" align="center"/>
          <el-table-column prop="name" label="权限名称" align="center"/>
          <el-table-column prop="code" label="权限标识符" align="center"/>
          <el-table-column prop="type" label="权限类型" align="center">
            <template #default="scope">
              <span :class="['permission-type-tag', scope.row.type === 1 ? 'menu' : 'button']">
                {{ scope.row.type === 1 ? '菜单' : '按钮' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <span :class="['status-tag', scope.row.status === 1? 'active' : 'disabled']">
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
                    @click.stop="deletePermission(scope.row)"
                >删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-box">
        <el-pagination
            v-model:current-page="permissionQueryForm.page"
            v-model:page-size="permissionQueryForm.size"
            :total="totalPermission"
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
      <template v-if="selectedPermission">
        <div class="container detail-container">
          <div class="panel-title">权限详情</div>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">权限ID:</span>
              <span class="detail-value">{{ selectedPermission?.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限名称:</span>
              <span class="detail-value">{{ selectedPermission?.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限标识符:</span>
              <span class="detail-value">{{ selectedPermission?.code }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态:</span>
              <!-- 根据状态值显示对应的文字 -->
              <span class="detail-value">{{
                  selectedPermission?.status === 1 ? '正常' : selectedPermission?.status === 0 ? '禁用' : '未知'
                }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限类型:</span>
              <!-- 根据状态值显示对应的文字 -->
              <span class="detail-value">{{
                  selectedPermission?.type === 1 ? '菜单' : selectedPermission?.type === 2 ? '按钮' : '未知'
                }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ selectedPermission?.create_time?.replace('T', ' ') }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">备注:</span>
              <span class="detail-value">{{ selectedPermission?.remark }}</span>
            </div>
          </div>
        </div>
      </template>
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
      <template>
        <el-form :model="dialogForm" label-width="100px" class="dialog-form">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="dialogForm.name"/>
          </el-form-item>
          <el-form-item label="权限标识符" prop="code">
            <el-input v-model="dialogForm.code"/>
          </el-form-item>
          <el-form-item label="权限类型" prop="type" style="width: 300px">
            <el-select
                v-model="dialogForm.type"
                placeholder="请选择权限类型"
            >
              <el-option
                  key="1"
                  label="菜单"
                  :value=1
              />
              <el-option
                  key="2"
                  label="按钮"
                  :value=2
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="formMode === 'edit'" label="状态" prop="status" style="width: 300px">
            <el-select
                v-model="dialogForm.status"
                placeholder="请选择权限状态"
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
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="dialogForm.path"/>
          </el-form-item>
          <el-form-item label="路由名称" prop="route_name">
            <el-input v-model="dialogForm.route_name"/>
          </el-form-item>
          <el-form-item label="权限描述" prop="remark">
            <el-input v-model="dialogForm.remark" type="textarea"/>
          </el-form-item>
        </el-form>
      </template>
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
  height: calc(100vh - $title-height-small - 30px);
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
    gap: 10px;
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
