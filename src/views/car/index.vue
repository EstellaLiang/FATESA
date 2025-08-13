<script setup lang="ts">
// import {ref, reactive, computed} from 'vue';
// import {Search, Refresh, Plus, Edit, Delete, Connection} from '@element-plus/icons-vue';
// import {useUWBStationStore, useUWBTagStore, useVehicleStore} from "@/store";
// import UWBTagAPI, {type UWBTag, type UWBTagQuery} from "@/api/uwb_tag";
// import VehicleAPI, {type Vehicle, type VehicleQueryForm, type VehicleUpdateParams} from "@/api/vehicle";
//
// // 菜单切换
// const currentMenu = ref(1); // 1-车辆管理, 2-定位卡管理
// const switchMemu = (type: number) => {
//   currentMenu.value = type;
// };
//
// // 获取基础数据
// const vehicleStore = useVehicleStore();
// // 车辆类型和列表
// const vehicleType = vehicleStore.vehicleTypeList;
// const currentVehicleType = ref<string>();
// const currentVehicleID = ref<string>();
// const currentVehicleList = computed(() => {
//   return vehicleStore.vehicleList.filter((vehicle) => {
//     return vehicle.type === currentVehicleType.value;
//   });
// });
//
// /* 车辆管理 */
// const totalVehicle = ref<number>(0);
// const vehicleList = ref<Vehicle[]>();
// const vehicleQueryForm = ref<VehicleQueryForm>({
//   page: 1,
//   page_size: 20
// });
//
//
// // 选中的车辆数据
// const selectedVehicle = ref<Vehicle>();
// // 选中的定位卡
// const selectedUWBTag = ref<UWBTag>();
// const handleRowClick = (row: any) => {
//   if (currentMenu.value === 1) {
//     selectedVehicle.value = row;
//   } else if (currentMenu.value === 2) {
//     selectedUWBTag.value = row;
//   }
// };
//
// const getVehicleList = async () => {
//   try {
//     const res = await VehicleAPI.getVehicleList(vehicleQueryForm.value);
//     vehicleList.value = res.list;
//     totalVehicle.value = res.total;
//   } catch (error) {
//     ElMessage.error('获取车辆列表失败');
//   }
// }
//
// // 分页器操作
// const handleSizeChange = (val: number) => {
//   if (currentMenu.value === 1) {
//     vehicleQueryForm.value.page_size = val;
//     getVehicleList();
//   } else if (currentMenu.value === 2) {
//     UWBTagQueryForm.value.page_size = val;
//     getUWBTagList();
//   }
// }
// const handleCurrentChange = (val: number) => {
//   if (currentMenu.value === 1) {
//     vehicleQueryForm.value.page = val;
//     getVehicleList();
//   } else if (currentMenu.value === 2) {
//     UWBTagQueryForm.value.page = val;
//     getUWBTagList();
//   }
// }
//
// // 重置查询表单
// const handleReset = async () => {
//   if (currentMenu.value === 1) {
//     currentVehicleType.value = '';
//     currentVehicleID.value = '';
//     vehicleQueryForm.value = {
//       page: 1,
//       page_size: 20
//     }
//     await getVehicleList();
//   } else {
//     UWBTagQueryForm.value = {
//       page: 1,
//       page_size: 20
//     }
//     await getUWBTagList();
//   }
// }
//
// // 查询车辆/定位卡
// const handleSearch = () => {
//   if (currentMenu.value === 1) {
//     getVehicleList();
//   } else if (currentMenu.value === 2) {
//     if (!UWBTagQueryForm.value.vehicle_id) {
//       ElMessage.error('请选择车辆ID');
//     }
//     getUWBTagList();
//   }
// }
//
//
// // 删除车辆
// const deleteVehicle = async (row: Vehicle) => {
//   try {
//     // 弹出确认对话框
//     await ElMessageBox.confirm('确定要删除该车辆吗？', '提示', {
//       confirmButtonText: '确定',
//       cancelButtonText: '取消',
//       type: 'warning'
//     });
//     // 调用删除接口
//     await VehicleAPI.deleteVehicle(row.id);
//     // 重新获取车辆列表
//     await getVehicleList();
//     // 提示删除成功
//     ElMessage.success('删除车辆成功');
//   } catch (error) {
//     if (error === 'cancel') {
//       // 用户取消删除操作，不做处理
//     } else {
//       // 处理删除失败的情况
//       console.error('删除车辆失败:', error);
//       ElMessage.error('删除车辆失败，请稍后重试');
//     }
//   }
// };
//
//
// /* 定位卡管理 */
// const UWBTagList = ref<UWBTag[]>();
// const totalUWBTag = ref<number>(0);
// const getUWBTagList = async () => {
//   try {
//     const res = await UWBTagAPI.getUWBTagList(UWBTagQueryForm.value);
//     UWBTagList.value = res.list;
//     totalUWBTag.value = res.total;
//   } catch (error) {
//     ElMessage.error('获取定位卡列表失败');
//   }
// }
//
// // 定位卡查询表单
// const UWBTagQueryForm = ref<UWBTagQuery>({
//   page: 1,
//   page_size: 20
// });
//
// // 删除定位卡
// const deleteUWBTag = async (row: UWBTag) => {
//   try {
//     // 弹出确认对话框
//     await ElMessageBox.confirm('确定要删除该定位卡吗？', '提示', {
//       confirmButtonText: '确定',
//       cancelButtonText: '取消',
//       type: 'warning'
//     });
//     // 调用删除接口
//     await UWBTagAPI.deleteUWBTag(row.id);
//     // 重新获取车辆列表
//     await getUWBTagList();
//     // 提示删除成功
//     ElMessage.success('删除定位卡成功');
//   } catch (error) {
//     if (error === 'cancel') {
//       // 用户取消删除操作，不做处理
//     } else {
//       // 处理删除失败的情况
//       console.error('删除定位卡失败:', error);
//       ElMessage.error('删除定位卡失败，请稍后重试');
//     }
//   }
// };
//
// // 定位卡与车辆绑定
// const bindedVehicleId = ref<string>();
//
// // const search = () => {
// //   const {carId, carType} = formData.value;
// //   filteredData.value = tableData.value.filter(item => {
// //     return (
// //         (!carId || item.carId.toLowerCase().includes(carId.toLowerCase())) &&
// //         (!carType || item.carType === carType)
// //     );
// //   });
// // };
// //
// // const reset = () => {
// //   formData.value = {carId: '', carType: ''};
// //   filteredData.value = [...tableData.value];
// //   // 重置详情栏
// //   selectedVehicle.value = null;
// // };
// //
//
//
// // const tableRowClassName = ({row: any}) => {
// //   if (selectedVehicle.value && selectedVehicle.value.carId === row.carId) {
// //     return 'selected-row';
// //   }
// //   return '';
// // };
//
// //
// // 对话框相关
// const dialogVisible = ref<boolean>(false);
// const dialogTitle = ref<string>('');
// const formMode = ref<string>('add'); // 'add' 或 'edit'
// const dialogForm = ref<Vehicle | UWBTag>()
//
// // // 表单默认值
// // const defaultFormValues = {
// //   carId: '',
// //   carType: '',
// //   condition: '',
// //   location: '',
// //   track: '',
// //   distribution: '',
// //   stopTime: ''
// // };
// //
//
// // 打开添加对话框
// const openAddDialog = () => {
//   formMode.value = 'add';
//   dialogTitle.value = '新增车辆';
//   Object.assign(dialogForm, defaultFormValues);
//   dialogVisible.value = true;
// };
//
//
// // 打开编辑对话框
// const openEditDialog = (row: Vehicle | UWBTag) => {
//   if (currentMenu.value === 1) {
//     formMode.value = 'edit1';
//     dialogTitle.value = '编辑车辆信息';
//     dialogForm.value = {...row};
//     dialogVisible.value = true;
//   } else {
//     formMode.value = 'edit2';
//     dialogTitle.value = '绑定车辆';
//     dialogForm.value = {...row};
//     currentVehicleType.value = row.vehicle_info?.type ? row.vehicle_info.type : '';
//     bindedVehicleId.value = row.vehicle_id ? row.vehicle_id : '';
//     dialogVisible.value = true;
//   }
// };
//
//
// // 提交表单
// const submitForm = async () => {
//   if (formMode.value === 'add') {
//     // // 检查车号是否为空
//     // if (!dialogForm.id) {
//     //   ElMessage.error('车号不能为空，请输入车号');
//     //   return;
//     // }
//     //
//     // // 检查车号是否已存在
//     // const exists = vehicleList.value.some(item => item.id === dialogForm.id);
//     // if (exists) {
//     //   ElMessage.error('车号已存在，请更换车号');
//     //   return;
//     // }
//     //
//     // // 调用新增车辆 API
//     // await VehicleAPI.addVehicle(dialogForm as Vehicle);
//     // ElMessage.success('新增车辆成功');
//     // // 重新获取车辆列表
//     // await vehicleStore.getVehicleList(vehicleQueryForm.value);
//     // vehicleList.value = vehicleStore.vehicleList;
//   } else if (formMode.value === 'edit1') {
//     // 编辑车辆
//     const updateParams: VehicleUpdateParams = {
//       type: dialogForm.value?.type,
//       stop_location: dialogForm.value?.stop_location,
//       load_status: dialogForm.value?.load_status,
//       ground_status: dialogForm.value?.ground_status,
//       health_status: dialogForm.value?.health_status,
//       status: dialogForm.value?.status
//     }
//     try {
//       await VehicleAPI.updateVehicle(dialogForm.value?.id as string, updateParams);
//       ElMessage.success('编辑车辆成功');
//       // 重新获取车辆列表
//       await getVehicleList();
//     } catch (error) {
//       console.error('车辆信息编辑失败:', error);
//       ElMessage.error('车辆信息编辑失败，请稍后重试');
//     }
//   } else if (formMode.value === 'edit2') {
//     // 检查是否选择了车辆 ID
//     if (!bindedVehicleId.value) {
//       ElMessage.error('请选择要绑定的车辆 ID');
//       return;
//     }
//     try {
//       // 调用 API 更新 UWB 定位卡信息
//       await UWBTagAPI.updateUWBTag(dialogForm.value?.id as number, bindedVehicleId.value);
//       ElMessage.success('定位卡绑定车辆成功');
//       // 重新获取定位卡列表
//       await getUWBTagList();
//     } catch (error) {
//       console.error('定位卡绑定车辆失败:', error);
//       ElMessage.error('定位卡绑定车辆失败，请稍后重试');
//     }
//   }
//   // 关闭对话框
//   dialogVisible.value = false;
// };
//
//
// onMounted(async () => {
//   await getVehicleList();
//   await getUWBTagList();
// })
</script>

<template>
  <div class="content-container">
<!--    &lt;!&ndash; 左侧面板 &ndash;&gt;-->
<!--    <div class="left-panel">-->
<!--      <div class="panel-title">车辆管理</div>-->
<!--      <div class="category-list">-->
<!--        <div class="category-item" :class="{ active: currentMenu === 1 }" @click="switchMemu(1)">-->
<!--          <span>车辆管理</span>-->
<!--          <span class="count">{{ totalVehicle }}</span>-->
<!--        </div>-->
<!--        <div class="category-item" :class="{ active: currentMenu === 2 }" @click="switchMemu(2)">-->
<!--          <span>定位卡管理</span>-->
<!--          <span class="count">{{ totalUWBTag }}</span>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    &lt;!&ndash; 车辆管理 &ndash;&gt;-->
<!--    <template v-show="currentMenu===1" class="center-panel">-->
<!--      &lt;!&ndash; 搜索区域与操作按钮 &ndash;&gt;-->
<!--      <el-form :model="vehicleList" class="search-bar">-->
<!--        <el-form-item label="车辆类型" prop="type">-->
<!--          <el-select-->
<!--              v-model="vehicleQueryForm.type"-->
<!--              placeholder="请选择车辆类型"-->
<!--              clearable-->
<!--          >-->
<!--            <el-option-->
<!--                v-for="item in vehicleType"-->
<!--                :key="item"-->
<!--                :label="item"-->
<!--                :value="item"-->
<!--            />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="装车状态" prop="load_status">-->
<!--          <el-select-->
<!--              v-model="vehicleQueryForm.load_status"-->
<!--              placeholder="请选择装车状态"-->
<!--              clearable-->
<!--          >-->
<!--            <el-option label="轻" value="0"/>-->
<!--            <el-option label="重" value="1"/>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="地面状态" prop="ground_status">-->
<!--          <el-select-->
<!--              v-model="vehicleQueryForm.ground_status"-->
<!--              placeholder="请选择地面状态"-->
<!--              clearable-->
<!--          >-->
<!--            <el-option label="井下" value="0"/>-->
<!--            <el-option label="井上" value="1"/>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="健康状态" prop="health_status">-->
<!--          <el-select-->
<!--              v-model="vehicleQueryForm.health_status"-->
<!--              placeholder="请选择健康状态"-->
<!--              clearable-->
<!--          >-->
<!--            <el-option label="不健康" value="0"/>-->
<!--            <el-option label="健康" value="1"/>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="使用状态" prop="status">-->
<!--          <el-select-->
<!--              v-model="vehicleQueryForm.status"-->
<!--              placeholder="请选择使用状态"-->
<!--              clearable-->
<!--          >-->
<!--            <el-option label="未使用" value="0"/>-->
<!--            <el-option label="使用" value="1"/>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <div class="action-buttons">-->
<!--          <el-button @click="handleSearch" :icon="Search" type="primary">搜索</el-button>-->
<!--          <el-button @click="handleReset" :icon="Refresh">重置</el-button>-->
<!--          <el-button @click="" :icon="Plus" type="primary">新增</el-button>-->
<!--        </div>-->
<!--      </el-form>-->

<!--      &lt;!&ndash; 表格区域 &ndash;&gt;-->
<!--      <div class="table-container">-->
<!--        <el-table-->
<!--            :data="vehicleList"-->
<!--            style="width: 100%; height: 100%;"-->
<!--            @row-click="handleRowClick"-->
<!--            highlight-current-row-->
<!--            height="100vh"-->
<!--        >-->
<!--          <el-table-column prop="id" label="车号" align="center"/>-->
<!--          <el-table-column prop="type" label="车辆类型" align="center"/>-->
<!--          <el-table-column label="装车状态" align="center">-->
<!--            <template #default="scope">-->
<!--              {{ scope.row.load_status === 0 ? '轻' : scope.row.load_status === 1 ? '重' : '' }}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="地面状态" align="center">-->
<!--            <template #default="scope">-->
<!--              {{ scope.row.ground_status === 0 ? '井下' : scope.row.ground_status === 1 ? '井上' : '' }}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="健康状态" align="center">-->
<!--            <template #default="scope">-->
<!--              {{ scope.row.health_status === 0 ? '不健康' : scope.row.health_status === 1 ? '健康' : '' }}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="使用状态" align="center">-->
<!--            <template #default="scope">-->
<!--              {{ scope.row.status === 0 ? '未使用' : scope.row.status === 1 ? '使用' : '' }}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="操作" width="180" align="center">-->
<!--            <template #default="scope">-->
<!--              <div class="operation-buttons">-->
<!--                <el-button-->
<!--                    type="primary"-->
<!--                    :icon="Edit"-->
<!--                    size="small"-->
<!--                    @click.stop="openEditDialog(scope.row)"-->
<!--                >编辑</el-button>-->
<!--                <el-button-->
<!--                    type="danger"-->
<!--                    :icon="Delete"-->
<!--                    size="small"-->
<!--                    @click.stop="deleteVehicle(scope.row)"-->
<!--                >删除</el-button>-->
<!--              </div>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--      </div>-->
<!--      <div class="pagination-box">-->
<!--        <el-pagination-->
<!--            v-model:current-page="vehicleQueryForm.page"-->
<!--            v-model:page-size="vehicleQueryForm.page_size"-->
<!--            :total="totalVehicle"-->
<!--            :page-sizes="[10, 20, 50]"-->
<!--            layout="sizes, prev, pager, next"-->
<!--            background-->
<!--            @size-change="handleSizeChange"-->
<!--            @current-change="handleCurrentChange"-->
<!--        />-->
<!--      </div>-->
<!--    </template>-->
<!--    <template v-show="currentMenu===2" class="center-panel">-->
<!--      &lt;!&ndash; 搜索区域与操作按钮 &ndash;&gt;-->
<!--      &lt;!&ndash;      <el-form :model="UWBTagQueryForm" class="search-bar">&ndash;&gt;-->
<!--      &lt;!&ndash;        <el-form-item label="车辆类型">&ndash;&gt;-->
<!--      &lt;!&ndash;          <el-select&ndash;&gt;-->
<!--      &lt;!&ndash;              v-model="currentVehicleType"&ndash;&gt;-->
<!--      &lt;!&ndash;              placeholder="请选择车辆类型"&ndash;&gt;-->
<!--      &lt;!&ndash;              clearable&ndash;&gt;-->
<!--      &lt;!&ndash;          >&ndash;&gt;-->
<!--      &lt;!&ndash;            <el-option&ndash;&gt;-->
<!--      &lt;!&ndash;                v-for="item in vehicleType"&ndash;&gt;-->
<!--      &lt;!&ndash;                :key="item"&ndash;&gt;-->
<!--      &lt;!&ndash;                :label="item"&ndash;&gt;-->
<!--      &lt;!&ndash;                :value="item"&ndash;&gt;-->
<!--      &lt;!&ndash;            />&ndash;&gt;-->
<!--      &lt;!&ndash;          </el-select>&ndash;&gt;-->
<!--      &lt;!&ndash;        </el-form-item>&ndash;&gt;-->
<!--      &lt;!&ndash;        <el-form-item label="车辆ID">&ndash;&gt;-->
<!--      &lt;!&ndash;          <el-select&ndash;&gt;-->
<!--      &lt;!&ndash;              v-model="UWBTagQueryForm.vehicle_id"&ndash;&gt;-->
<!--      &lt;!&ndash;              placeholder="请选择车辆ID"&ndash;&gt;-->
<!--      &lt;!&ndash;              clearable&ndash;&gt;-->
<!--      &lt;!&ndash;          >&ndash;&gt;-->
<!--      &lt;!&ndash;            <el-option&ndash;&gt;-->
<!--      &lt;!&ndash;                v-for="item in currentVehicleList"&ndash;&gt;-->
<!--      &lt;!&ndash;                :key="item.id"&ndash;&gt;-->
<!--      &lt;!&ndash;                :label="item.id"&ndash;&gt;-->
<!--      &lt;!&ndash;                :value="item.id"&ndash;&gt;-->
<!--      &lt;!&ndash;            />&ndash;&gt;-->
<!--      &lt;!&ndash;          </el-select>&ndash;&gt;-->
<!--      &lt;!&ndash;        </el-form-item>&ndash;&gt;-->
<!--      &lt;!&ndash;        <el-button @click="" :icon="Plus" type="primary">新增</el-button>&ndash;&gt;-->
<!--      &lt;!&ndash;        <el-button @click="handleSearch" :icon="Search" type="primary">搜索</el-button>&ndash;&gt;-->
<!--      &lt;!&ndash;        <el-button @click="handleReset" :icon="Refresh">重置</el-button>&ndash;&gt;-->
<!--      &lt;!&ndash;      </el-form>&ndash;&gt;-->

<!--      &lt;!&ndash; 表格区域 &ndash;&gt;-->
<!--      <div class="table-container">-->
<!--        <el-table-->
<!--            :data="UWBTagList"-->
<!--            style="width: 100%; height: 100%;"-->
<!--            @row-click="handleRowClick"-->
<!--            highlight-current-row-->
<!--            height="100vh"-->
<!--        >-->
<!--          <el-table-column prop="id" label="ID" align="center"/>-->
<!--          <el-table-column prop="vehicle_id" label="车号" align="center">-->
<!--            <template #default="scope">-->
<!--              {{ scope.row.vehicle_id ? scope.row.vehicle_id : '/' }}-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column prop="create_time" label="创建时间" align="center"/>-->
<!--          <el-table-column prop="update_time" label="更新时间" align="center"/>-->
<!--          <el-table-column label="操作" width="200" align="center">-->
<!--            <template #default="scope">-->
<!--              <div class="operation-buttons">-->
<!--                <el-button-->
<!--                    type="primary"-->
<!--                    :icon="Connection"-->
<!--                    size="small"-->
<!--                    @click.stop="openEditDialog(scope.row)"-->
<!--                    class="edit-button"-->
<!--                >绑定车辆</el-button>-->
<!--                <el-button-->
<!--                    type="danger"-->
<!--                    :icon="Delete"-->
<!--                    size="small"-->
<!--                    @click.stop="deleteUWBTag(scope.row)"-->
<!--                    class="delete-button"-->
<!--                >删除</el-button>-->
<!--              </div>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--      </div>-->
<!--      <div class="pagination-box">-->
<!--        <el-pagination-->
<!--            v-model:current-page="UWBTagQueryForm.page"-->
<!--            v-model:page-size="UWBTagQueryForm.page_size"-->
<!--            :total="totalUWBTag"-->
<!--            :page-sizes="[10, 20, 50]"-->
<!--            layout="sizes, prev, pager, next"-->
<!--            background-->
<!--            @size-change="handleSizeChange"-->
<!--            @current-change="handleCurrentChange"-->
<!--        />-->
<!--      </div>-->
<!--    </template>-->
<!--    &lt;!&ndash; 右侧详情页 &ndash;&gt;-->
<!--    <div class="right-panel">-->
<!--      <template v-if="currentMenu===1">-->
<!--        <div class="container detail-container">-->
<!--          <div class="panel-title">车辆详情</div>-->
<!--          <div v-if="selectedVehicle" class="detail-content">-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">车号:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.id }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">车辆类型:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.type }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">停放位置:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.stop_location }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">装车状态:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.load_status ? "重" : "轻" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">地面状态:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.ground_status ? "健康" : "不健康" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">健康状态:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.health_status ? "健康" : "不健康" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">使用状态:</span>-->
<!--              <span class="detail-value">{{ selectedVehicle?.status ? "使用" : "未使用" }}</span>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div v-else class="no-data">-->
<!--            <p>请选择左侧表格中的一行数据查看详情</p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->
<!--      <template v-if="currentMenu===2">-->
<!--        <div class="container detail-container">-->
<!--          <div class="panel-title">车辆详情</div>-->
<!--          <div v-if="selectedUWBTag" class="detail-content">-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">定位卡ID:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag?.id }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">车号:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.id }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">车辆类型:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.type }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">停放位置:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.stop_location }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">装车状态:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.load_status ? "重" : "轻" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">地面状态:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.ground_status ? "健康" : "不健康" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">健康状态:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.health_status ? "健康" : "不健康" }}</span>-->
<!--            </div>-->
<!--            <div class="detail-item">-->
<!--              <span class="detail-label">使用状态:</span>-->
<!--              <span class="detail-value">{{ selectedUWBTag.vehicle_info?.status ? "使用" : "未使用" }}</span>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div v-else class="no-data">-->
<!--            <p>请选择左侧表格中的一行数据查看详情</p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->
<!--    </div>-->
<!--    &lt;!&ndash; 新增/编辑对话框 &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible"-->
<!--        :title="dialogTitle"-->
<!--        width="500px"-->
<!--        :close-on-click-modal="false"-->
<!--        :close-on-press-escape="false"-->
<!--    >-->
<!--      <template v-if="formMode === 'edit1'">-->
<!--        <el-form :model="dialogForm" label-width="100px" class="dialog-form">-->
<!--          <el-form-item label="车号" prop="id">-->
<!--            <el-input v-model="dialogForm.id" :disabled="formMode === 'edit1'"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="车辆类型" prop="type">-->
<!--            <el-select v-model="dialogForm.type" placeholder="请选择车辆类型" style="width: 100%">-->
<!--              <el-option-->
<!--                  v-for="item in vehicleType"-->
<!--                  :key="item"-->
<!--                  :label="item"-->
<!--                  :value="item"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="停放位置" prop="stop_location">-->
<!--            <el-input v-model="dialogForm.stop_location"/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="装车状态" prop="load_status">-->
<!--            <el-select-->
<!--                v-model="dialogForm.load_status"-->
<!--                placeholder="请选择装车状态"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option label="轻" :value="0"/>-->
<!--              <el-option label="重" :value="1"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="地面状态" prop="ground_status">-->
<!--            <el-select-->
<!--                v-model="dialogForm.ground_status"-->
<!--                placeholder="请选择地面状态"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option label="井下" :value="0"/>-->
<!--              <el-option label="井上" :value="1"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="健康状态" prop="health_status">-->
<!--            <el-select-->
<!--                v-model="dialogForm.health_status"-->
<!--                placeholder="请选择健康状态"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option label="不健康" :value="0"/>-->
<!--              <el-option label="健康" :value="1"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="使用状态" prop="status">-->
<!--            <el-select-->
<!--                v-model="dialogForm.status"-->
<!--                placeholder="请选择使用状态"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option label="未使用" :value="0"/>-->
<!--              <el-option label="使用" :value="1"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->

<!--        </el-form>-->
<!--      </template>-->
<!--      <template v-if="formMode === 'edit2'">-->
<!--        <el-form label-width="100px" class="dialog-form">-->
<!--          <el-form-item label="车辆类型" prop="vehicle_info.type">-->
<!--            <el-select-->
<!--                v-model="currentVehicleType"-->
<!--                placeholder="请选择车辆类型"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="item in vehicleType"-->
<!--                  :key="item"-->
<!--                  :label="item"-->
<!--                  :value="item"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="车辆ID" prop="vehicle_id">-->
<!--            <el-select-->
<!--                v-model="bindedVehicleId"-->
<!--                placeholder="请选择车辆ID"-->
<!--                clearable-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="item in currentVehicleList"-->
<!--                  :key="item.id"-->
<!--                  :label="item.id"-->
<!--                  :value="item.id"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--      </template>-->
<!--      <div class="dialog-footer">-->
<!--        <el-button @click="dialogVisible = false" class="custom-button cancel-button">取消</el-button>-->
<!--        <el-button @click="submitForm" class="custom-button confirm-button">确定</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->
  </div>
</template>

<style scoped lang="scss">
.content-container {
  width: 100%;
  height: calc(100vh - 120px);
  color: #fff;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background: rgba(6, 48, 108, 0.5);
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(77, 179, 255, 0.1);
}

.left-panel {
  width: 200px;
  background-color: rgba(0, 21, 41, 0.4);
  border-right: 1px solid rgba(77, 179, 255, 0.3);
  display: flex;
  flex-direction: column;

  .panel-title {
    padding: 15px;
    font-size: 16px;
    font-weight: bold;
    color: #4db3ff;
    border-bottom: 1px solid rgba(77, 179, 255, 0.3);
    background: linear-gradient(90deg, rgba(10, 73, 134, 0.4), rgba(10, 73, 134, 0.2));
    text-align: center;
  }


  div[style*="padding: 10px 15px;"] {
    border-bottom: 1px solid rgba(77, 179, 255, 0.2);
  }

  .category-list .category-item {
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid rgba(77, 179, 255, 0.2);
  }

  .category-list .category-item:hover {
    background-color: rgba(77, 179, 255, 0.1);
  }

  .category-list .category-item.active {
    background-color: rgba(77, 179, 255, 0.2);
    border-left: 3px solid #4db3ff;
    color: #66caff;
  }

  .category-list .category-item .count {
    background-color: rgba(77, 179, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
  }
}

.center-panel {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  background-color: rgba(0, 21, 41, 0.4);
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;

  .search-bar {
    display: flex;
    justify-content: start;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    padding: 15px;
    background: linear-gradient(90deg, rgba(10, 73, 134, 0.4), rgba(10, 73, 134, 0.2));
    border: 1px solid rgba(77, 179, 255, 0.3);
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
    margin: 10px 0;
    display: flex;
    justify-content: end;
    align-items: center;
  }
}

.right-panel {
  width: 20vw;
  background-color: rgba(0, 21, 41, 0.4);
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.table-container {
  overflow: hidden;
  flex-grow: 1;
  background-color: rgba(5, 41, 92, 0.2);
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
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
  font-size: 14px;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  color: #fff;
}


.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #a0a0a0;
  font-style: italic;
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
</style>
