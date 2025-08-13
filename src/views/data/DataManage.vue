```vue
<template>
  <div class="eye-tracking-container">
    <div class="center-panel">
      <!-- 搜索区域与操作按钮 -->
      <el-form :model="filterForm" class="search-bar">
        <el-form-item label="实验ID">
          <el-input v-model="filterForm.experimentId" placeholder="请输入实验ID" clearable/>
        </el-form-item>
        <el-form-item label="用户">
          <el-select v-model="filterForm.userId" placeholder="请选择用户" clearable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="时间段">
          <el-date-picker
              v-model="filterForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <div class="action-buttons">
          <el-button @click="handleSearch" :icon="Search" type="primary">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </div>
      </el-form>

      <!-- 中间数据表格 -->
      <div class="table-container">
        <el-table
            :data="paginatedData"
            @row-click="handleRowClick"
            highlight-current-row
            style="width: 100%; height: 100%"
            height="100%"
        >
          <el-table-column prop="id" label="数据ID" align="center" width="80"/>
          <el-table-column prop="experimentId" label="实验ID" align="center"/>
          <el-table-column prop="userName" label="测试人员" align="center"/>
          <el-table-column prop="sightX" label="视线X" align="center" width="90">
            <template #default="scope">
              <el-tooltip :content="String(scope.row.sightX)" placement="top" effect="dark">
                <span>{{ Number(scope.row.sightX).toFixed(2) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="sightY" label="视线Y" align="center" width="90">
            <template #default="scope">
              <el-tooltip :content="String(scope.row.sightY)" placement="top" effect="dark">
                <span>{{ Number(scope.row.sightY).toFixed(2) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="sightZ" label="视线Z" align="center" width="90">
            <template #default="scope">
              <el-tooltip :content="String(scope.row.sightZ)" placement="top" effect="dark">
                <span>{{ Number(scope.row.sightZ).toFixed(2) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="gazeX" label="注视X" align="center" width="80"/> -->
          <!-- <el-table-column prop="gazeY" label="注视Y" align="center" width="80"/> -->
          <el-table-column prop="gazeObjectId" label="注视对象" align="center">
            <template #default="scope">
              <el-tooltip :content="scope.row.gazeObjectId ?? '无'" placement="top" effect="dark">
                <span>{{ scope.row.gazeObjectId ?? '无' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="pupilDiameter" label="瞳孔直径" align="center" width="110">
            <template #default="scope">
              <el-tooltip :content="String(scope.row.pupilDiameter) + ' mm'" placement="top" effect="dark">
                <span>{{ Number(scope.row.pupilDiameter).toFixed(2) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="scope">
              <el-tooltip :content="scope.row.createTime" placement="top" effect="dark">
                <span>{{ scope.row.createTime }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <div class="operation-buttons">
                <!-- <el-button size="small" @click.stop="viewDetails(scope.row)">查看</el-button> -->
                <el-button size="small" type="danger" @click.stop="deleteData(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-box">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            background
            style="margin-top: 15px; text-align: right;"
        />
      </div>
    </div>

    <!-- 右侧详情页 -->
    <div class="right-panel">
      <template v-if="selectedData">
        <div class="detail-container">
          <div class="panel-title">眼动数据详情</div>
          <div class="detail-content">
            <div class="detail-item">
              <span class="detail-label">数据ID:</span>
              <span class="detail-value">{{ selectedData.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">实验ID:</span>
              <span class="detail-value">{{ selectedData.experimentId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">测试人员:</span>
              <span class="detail-value">{{ getUserName(selectedData.userId) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">视线坐标:</span>
              <span class="detail-value">X: {{ selectedData.sightX.toFixed(2) }}, Y: {{
                  selectedData.sightY.toFixed(2)
                }}, Z: {{ selectedData.sightZ.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">注视坐标:</span>
              <span class="detail-value">X: {{ selectedData.gazeX.toFixed(2) }}, Y: {{
                  selectedData.gazeY.toFixed(2)
                }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">注视对象:</span>
              <span class="detail-value">{{ selectedData.gazeObjectId || '无' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">瞳孔直径:</span>
              <span class="detail-value">{{ selectedData.pupilDiameter.toFixed(2) }} mm</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ selectedData.createTime }}</span>
            </div>

            <!-- 眼动轨迹可视化 -->
            <div class="visualization-preview">
              <div class="preview-title">眼动轨迹图</div>
              <div class="chart-container">
                <canvas id="eye-tracking-preview"></canvas>
              </div>
            </div>

            <!-- 瞳孔直径变化图 -->
            <div class="visualization-preview">
              <div class="preview-title">瞳孔直径变化</div>
              <div class="chart-container">
                <canvas id="pupil-diameter-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="detail-container">
          <div class="panel-title">详情</div>
          <div class="no-data">
            <p>请选择左侧表格中的一行数据查看详情</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import Chart from 'chart.js/auto';
import {Refresh, Search} from "@element-plus/icons-vue";

// 定义数据类型
interface User {
  id: number;
  name: string;
}

interface EyeTrackingData {
  id: number;
  experimentId: number;
  userId: number;
  sightX: number;
  sightY: number;
  sightZ: number;
  gazeX: number;
  gazeY: number;
  gazeObjectId: string | null;
  pupilDiameter: number;
  createTime: string;
}

interface FilterForm {
  experimentId: string;
  userId: number | string;
  timeRange: string[];
}

// 模拟用户数据
const users: User[] = [
  {id: 1, name: '张三'},
  {id: 2, name: '李四'},
  {id: 3, name: '王五'},
  {id: 4, name: '赵六'},
  {id: 5, name: '孙七'}
];

// 生成模拟眼动数据
function generateEyeTrackingData(): EyeTrackingData[] {
  const data: EyeTrackingData[] = [];
  const baseTime = new Date('2025-08-02 09:00:00').getTime();

  for (let i = 1; i <= 1000; i++) {
    const timestamp = new Date(baseTime + i * 100); // 每100ms一个数据点

    data.push({
      id: i,
      experimentId: Math.floor(Math.random() * 5) + 1,
      userId: Math.floor(Math.random() * 5) + 1,
      sightX: Math.random() * 1920,
      sightY: Math.random() * 1080,
      sightZ: Math.random() * 100 - 50, // -50 到 50
      gazeX: Math.random() * 1920,
      gazeY: Math.random() * 1080,
      gazeObjectId: Math.random() > 0.3 ? `obj_${Math.floor(Math.random() * 10) + 1}` : null,
      pupilDiameter: 2.5 + Math.random() * 2, // 2.5-4.5mm
      createTime: timestamp.toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  return data;
}

// 状态管理
const allData = ref<EyeTrackingData[]>(generateEyeTrackingData());
const filteredData = ref<EyeTrackingData[]>([...allData.value]);
const filterForm = ref<FilterForm>({
  experimentId: '',
  userId: '',
  timeRange: []
});
const selectedData = ref<EyeTrackingData | null>(null);
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(allData.value.length);

// 图表实例
let eyeTrackingChart: Chart | null = null;
let pupilDiameterChart: Chart | null = null;

// 生命周期钩子
onMounted(() => {
  // 初始不渲染图表，等待用户选择数据
});

// 筛选数据
const handleSearch = () => {
  filteredData.value = allData.value.filter(item => {
    const experimentMatch = !filterForm.value.experimentId ||
        item.experimentId.toString() === filterForm.value.experimentId;
    const userMatch = !filterForm.value.userId ||
        item.userId === filterForm.value.userId;
    const timeMatch = filterForm.value.timeRange && filterForm.value.timeRange.length === 2
        ? (item.createTime >= filterForm.value.timeRange[0] && item.createTime <= filterForm.value.timeRange[1])
        : true;

    return experimentMatch && userMatch && timeMatch;
  });

  total.value = filteredData.value.length;
  currentPage.value = 1;
};

// 重置筛选
const handleReset = () => {
  filterForm.value = {
    experimentId: '',
    userId: '',
    timeRange: []
  };
  filteredData.value = [...allData.value];
  total.value = allData.value.length;
  currentPage.value = 1;
};

// 分页事件
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置到第一页
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
};

// 处理行点击
const handleRowClick = (row: EyeTrackingData) => {
  selectedData.value = {...row};

  nextTick(() => {
    renderEyeTrackingChart();
    renderPupilDiameterChart();
  });
};

// 渲染眼动轨迹图
const renderEyeTrackingChart = () => {
  if (!selectedData.value) return;

  const ctx = document.getElementById('eye-tracking-preview') as HTMLCanvasElement;
  if (!ctx) return;

  // 如果图表已存在，先销毁
  if (eyeTrackingChart) {
    eyeTrackingChart.destroy();
  }

  // 获取同一实验的连续数据点
  const experimentData = allData.value
      .filter(item => item.experimentId === selectedData.value?.experimentId)
      .slice(0, 100); // 限制数据点数量

  eyeTrackingChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: '视线坐标',
        data: experimentData.map(item => ({x: item.sightX, y: item.sightY})),
        backgroundColor: 'rgba(64, 158, 255, 0.3)',
        borderColor: '#409EFF',
        borderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 4
      }, {
        label: '注视坐标',
        data: experimentData.map(item => ({x: item.gazeX, y: item.gazeY})),
        backgroundColor: 'rgba(255, 64, 64, 0.3)',
        borderColor: '#FF4040',
        borderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          min: 0,
          max: 1920,
          title: {
            display: true,
            text: 'X 坐标 (像素)'
          }
        },
        y: {
          min: 0,
          max: 1080,
          reverse: true,
          title: {
            display: true,
            text: 'Y 坐标 (像素)'
          }
        }
      },
      animation: {
        duration: 1000
      }
    }
  });
};

// 渲染瞳孔直径变化图
const renderPupilDiameterChart = () => {
  if (!selectedData.value) return;

  const ctx = document.getElementById('pupil-diameter-chart') as HTMLCanvasElement;
  if (!ctx) return;

  // 如果图表已存在，先销毁
  if (pupilDiameterChart) {
    pupilDiameterChart.destroy();
  }

  // 获取同一实验的连续数据点
  const experimentData = allData.value
      .filter(item => item.experimentId === selectedData.value?.experimentId)
      .slice(0, 50); // 限制数据点数量

  pupilDiameterChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: experimentData.map((_, index) => index + 1),
      datasets: [{
        label: '瞳孔直径 (mm)',
        data: experimentData.map(item => item.pupilDiameter),
        borderColor: '#67C23A',
        backgroundColor: 'rgba(103, 194, 58, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '数据点序号'
          }
        },
        y: {
          title: {
            display: true,
            text: '瞳孔直径 (mm)'
          },
          min: 2,
          max: 5
        }
      },
      animation: {
        duration: 1000
      }
    }
  });
};

// 查看详情
const viewDetails = (row: EyeTrackingData) => {
  selectedData.value = {...row};

  nextTick(() => {
    renderEyeTrackingChart();
    renderPupilDiameterChart();
  });
};

// 删除数据
const deleteData = (row: EyeTrackingData) => {
  ElMessageBox.confirm(
      `确定要删除眼动数据 ID: ${row.id} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    allData.value = allData.value.filter(item => item.id !== row.id);
    handleSearch();

    // 如果删除的是当前选中的数据，清空详情
    if (selectedData.value?.id === row.id) {
      selectedData.value = null;
    }

    ElMessage.success('删除成功');
  }).catch(() => {
    // 用户取消操作
  });
};

// 获取用户名
const getUserName = (userId: number) => {
  return users.find(u => u.id === userId)?.name || '未知用户';
};

// 计算属性：为表格数据添加用户名
const tableData = computed(() => {
  return filteredData.value.map(item => ({
    ...item,
    userName: getUserName(item.userId)
  }));
});

// 计算属性：分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

// 扩展类型以包含计算属性
interface TableDataItem extends EyeTrackingData {
  userName: string;
}
</script>

<style scoped lang="scss">
.eye-tracking-container {
  box-sizing: border-box;
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(77, 179, 255, 0.1);
  display: flex;
  gap: 10px;
  overflow: hidden;
  height: calc(100vh - $title-height-small - 30px); /* 限制高度 */
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
    flex-shrink: 0;

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

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }
  }

  .pagination-box {
    height: 50px;
    display: flex;
    justify-content: end;
    align-items: center;
    flex-shrink: 0;
    padding: 10px 0;
  }
}

.right-panel {
  width: 350px; /* 固定宽度 */
  min-width: 300px; /* 最小宽度 */
  max-width: 400px; /* 最大宽度 */
  background-color: rgba(0, 21, 41, 0.4);
  border: 1px dashed rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  margin: 10px 10px 10px 0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

/* 3. 表格容器 */
.table-container {
  flex: 1;
  overflow: hidden;
  background-color: rgba(5, 41, 92, 0.2);
  border: 1px dashed rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 4. 详情面板 */
.detail-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #fff;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding-right: 5px;
}

.detail-item {
  display: flex;
  gap: 5px;
}

.detail-label {
  width: 80px;
  color: #a0a0a0;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  word-break: break-word;
}

.no-data {
  margin: 10px;
  text-align: center;
  color: #a0a0a0;
}

.operation-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
}

/* 5. 数据可视化预览 */
.visualization-preview {
  margin-top: 20px;
  flex-shrink: 0;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.chart-container {
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
}

/* 6. 响应式设计 */
@media (max-width: 1200px) {
  .eye-tracking-container {
    flex-direction: column;
    height: auto;
    min-height: 600px;
  }

  .right-panel {
    width: 100%;
    margin: 10px 0;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .eye-tracking-container {
    padding: 5px;
    gap: 5px;
  }

  .center-panel {
    padding: 5px;
  }

  .right-panel {
    padding: 10px;
  }
}

/* 关键：用 ::v-deep 穿透 scoped，只修改当前组件内带 custom-label 的表单项 */
.custom-title-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

.custom-user-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

.custom-duration-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

.custom-status-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

.custom-content-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

.custom-pt-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

/* 隐藏滚动条但保持功能 */
.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: transparent;
}

.detail-content::-webkit-scrollbar-thumb {
  background: rgba(77, 179, 255, 0.3);
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 179, 255, 0.5);
}
</style>
