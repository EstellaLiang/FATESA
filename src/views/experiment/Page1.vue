<template>
  <div class="content-container">
    <!-- 第一栏：顶部搜索和操作区 -->
    <div class="top-panel">
      <el-form :model="queryForm" class="search-bar">
        <el-form-item label="实验标题" prop="title">
          <el-input v-model="queryForm.title" placeholder="输入实验标题" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryForm.status" placeholder="选择状态" clearable>
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <div class="action-buttons">
          <el-button @click="handleSearch" type="primary">搜索</el-button>
          <el-button @click="handleReset" type="default">重置</el-button>
          <el-button @click="openAddDialog" type="primary">新增</el-button>
        </div>
      </el-form>
    </div>

    <div class="middle-right-container">
      <!-- 第二栏：中间实验数据表格 -->
      <div class="middle-panel">
        <div class="table-container">
          <el-table
              :data="filteredExperiments"
              @row-click="handleRowClick"
              highlight-current-row
              style="width: 100%; height: 100%"
          >
            <el-table-column prop="id" label="实验ID" align="center" />
            <el-table-column prop="title" label="标题" align="center" />
            <el-table-column prop="time" label="时间" align="center" />
            <el-table-column prop="status" label="状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'ongoing' ? 'primary' : scope.row.status === 'completed' ? 'success' : 'info'">
                  {{ scope.row.status === "ongoing" ? "进行中" : scope.row.status === "completed" ? "已完成" : "已归档" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" align="center">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button size="small" @click.stop="openEditDialog(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click.stop="deleteExperiment(scope.row)">删除</el-button>
                  <el-button size="small" @click.stop="archiveExperiment(scope.row)">归档</el-button>
                  <el-button size="small" type="primary" @click.stop="startExperiment(scope.row)">启动</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 第三栏：右侧详情页 -->
      <div class="right-panel">
        <template v-if="selectedExperiment">
          <div class="container detail-container">
            <div class="panel-title">实验详情</div>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">实验ID:</span>
                <span class="detail-value">{{ selectedExperiment.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">实验标题:</span>
                <span class="detail-value">{{ selectedExperiment.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">时间:</span>
                <span class="detail-value">{{ selectedExperiment.time }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">状态:</span>
                <span class="detail-value">
                  {{ selectedExperiment.status === "ongoing" ? "进行中" : selectedExperiment.status === "completed" ? "已完成" : "已归档" }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">实验内容:</span>
                <span class="detail-value">{{ selectedExperiment.content || '无' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">参与人员:</span>
                <span class="detail-value">{{ selectedExperiment.participants?.join(', ') || '无' }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="container detail-container">
            <div class="panel-title">详情</div>
            <div class="no-data">
              <p>请选择左侧表格中的一行数据查看详情</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="dialogForm" label-width="100px" class="dialog-form">
        <el-form-item prop="title">
          <!-- 自定义 label 内容，手动加类名 -->
          <template #label>
            <span class="custom-label custom-title-label">标题</span>
          </template>
          <el-input v-model="dialogForm.title"/>
        </el-form-item>
        <el-form-item prop="time">
          <template #label>
            <span class="custom-label custom-time-label">时间</span>
          </template>
          <el-input v-model="dialogForm.time" />
        </el-form-item>

        <el-form-item prop="content">
          <template #label>
            <span class="custom-label custom-content-label">内容</span>
          </template>
          <el-input v-model="dialogForm.content" />
        </el-form-item>

        <el-form-item prop="participants">
          <template #label>
            <span class="custom-label custom-participants-label">参与人员</span>
          </template>
          <el-input v-model="dialogForm.participants" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 定义实验类型
interface Experiment {
  id: number;
  title: string;
  time: string;
  content: string;
  participants: string[];
  status: "ongoing" | "completed" | "archived";
}

// 直接在代码中定义的假实验数据
const fakeExperiments: Experiment[] = [
  { id: 1, title: "实验1", time: "2023-10-01 10:00", content: "测试实验", participants: ["张三", "李四"], status: "ongoing" },
  { id: 2, title: "实验2", time: "2023-10-02 14:00", content: "眼动实验", participants: ["王五"], status: "completed" },
];

const experimentList = ref<Experiment[]>([]);
const queryForm = ref({ title: "", status: "" });
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogForm = ref<Partial<Experiment>>({});
const formMode = ref<"add" | "edit">("add");
const selectedExperiment = ref<Experiment | null>(null); // 新增：用于存储选中的实验详情

// 筛选实验数据
const filteredExperiments = computed(() => {
  return experimentList.value.filter(
      (exp) =>
          (!queryForm.value.title || exp.title.includes(queryForm.value.title)) &&
          (!queryForm.value.status || exp.status === queryForm.value.status)
  );
});

// 行点击事件 - 同时更新选中的实验详情
const handleRowClick = (row: Experiment) => {
  console.log("选中的实验:", row);
  selectedExperiment.value = row; // 更新选中的实验
};

// 搜索处理
const handleSearch = () => {
  // 筛选逻辑由 computed 属性处理
};

// 新增：重置搜索条件
const handleReset = () => {
  queryForm.value = { title: "", status: "" };
};

// 打开新增对话框
const openAddDialog = () => {
  formMode.value = "add";
  dialogTitle.value = "新增实验";
  dialogForm.value = {};
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row: Experiment) => {
  formMode.value = "edit";
  dialogTitle.value = "编辑实验";
  // 处理参与人员为数组的情况
  dialogForm.value = {
    ...row,
    participants: row.participants?.join(', ') // 转换为逗号分隔的字符串
  };
  dialogVisible.value = true;
};

// 提交表单
const submitForm = () => {
  if (formMode.value === "add") {
    // 处理参与人员为数组
    const participants = dialogForm.value.participants
        ? (dialogForm.value.participants as string).split(',').map(p => p.trim())
        : [];

    const newExperiment = {
      ...dialogForm.value,
      id: experimentList.value.length + 1,
      status: "ongoing",
      participants
    } as Experiment;
    experimentList.value.push(newExperiment);
    ElMessage.success("实验添加成功");
  } else {
    // 处理参与人员为数组
    const participants = dialogForm.value.participants
        ? (dialogForm.value.participants as string).split(',').map(p => p.trim())
        : [];

    const index = experimentList.value.findIndex(
        (exp) => exp.id === dialogForm.value.id
    );
    experimentList.value[index] = {
      ...dialogForm.value,
      participants
    } as Experiment;

    // 如果编辑的是当前选中的实验，同步更新详情
    if (selectedExperiment.value?.id === dialogForm.value.id) {
      selectedExperiment.value = experimentList.value[index];
    }

    ElMessage.success("实验更新成功");
  }
  dialogVisible.value = false;
};

// 删除实验
const deleteExperiment = (row: Experiment) => {
  ElMessageBox.confirm("确定删除该实验吗？", "警告", {
    type: "warning",
  }).then(() => {
    // 如果删除的是当前选中的实验，清空详情
    if (selectedExperiment.value?.id === row.id) {
      selectedExperiment.value = null;
    }

    experimentList.value = experimentList.value.filter(
        (exp) => exp.id !== row.id
    );
    ElMessage.success("实验删除成功");
  });
};

// 归档实验
const archiveExperiment = (row: Experiment) => {
  ElMessageBox.confirm("确定归档该实验吗？", "警告", {
    type: "warning",
  }).then(() => {
    const index = experimentList.value.findIndex((exp) => exp.id === row.id);
    experimentList.value[index].status = "archived";

    // 如果归档的是当前选中的实验，同步更新详情
    if (selectedExperiment.value?.id === row.id) {
      selectedExperiment.value = experimentList.value[index];
    }

    ElMessage.success("实验归档成功");
  });
};

// 启动实验
const startExperiment = (row: Experiment) => {
  ElMessage.info(`启动实验 ${row.title}，跳转至实时检测模块`);
};

// 页面加载时初始化数据
onMounted(() => {
  experimentList.value = fakeExperiments;
});
</script>

<style scoped lang="scss">
/* 1. 基础容器：控制整个页面布局 */
.content-container {
  width: 100vw;
  height: calc(100vh - $title-height-small - 30px);
  box-sizing: border-box;
  margin: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden; /* 防止整体溢出 */
}

/* 2. 第一栏：顶部搜索区 */
.top-panel {
  flex: 0 0 auto;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  padding: 10px;
}

/* 3. 中间容器（包含第二栏和第三栏） */
.middle-right-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 10px;
  min-height: 0; /* 关键：允许容器收缩 */
}

/* 4. 第二栏：中间表格区 */
.middle-panel {
  flex: 1;
  box-sizing: border-box;
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保子元素溢出时不撑大容器 */
}

/* 表格容器：自适应中间栏高度 */
.table-container {
  flex: 1;
  overflow: auto;
  padding: 10px;
  min-height: 0; /* 关键：允许表格容器收缩 */
}

/* 5. 第三栏：右侧详情区 */
.right-panel {
  flex: 0 0 300px;
  box-sizing: border-box;
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保子元素溢出时不撑大容器 */
}

/* 详情内容区：自适应右侧栏高度 */
.detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: rgba(0, 21, 41, 0.4);
  overflow: hidden; /* 确保子元素溢出时不撑大容器 */
}

/* 详情内容滚动区 */
.detail-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 关键：允许详情内容收缩 */
}

/* 其他样式（保持原有风格） */
.search-bar {
  display: flex;
  justify-content: start;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  line-height: 1.5;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.detail-value {
  flex: 1;
  word-break: break-all;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  flex-direction: column;
  gap: 10px;
}

.operation-buttons {
  display: flex;
  gap: 5px;
}

/* 6. 响应式设计（小屏幕适配） */
@media (max-width: 768px) {
  .middle-right-container {
    flex-direction: column; /* 小屏幕时中间栏和第三栏垂直排列 */
  }
  .right-panel {
    flex: 0 0 auto; /* 高度自适应内容 */
    width: 100%; /* 占满宽度 */
  }
}
/* 标题标签颜色 */
.custom-title-label {
  color: #000000; /* 自定义颜色 */
  font-weight: bold;
}

/* 时间标签颜色 */
.custom-time-label {
  color: #000000;
  font-weight: bold;
}

/* 内容标签颜色 */
.custom-content-label {
  color: #000000;
  font-weight: bold;
}

/* 参与人员标签颜色 */
.custom-participants-label {
  color: #000000;
  font-weight: bold;
}

.dialog-form {
  :deep( .el-form-item) {
    margin-bottom: 22px;

    .el-input__inner {
      color: #222;
    }
  }
}
</style>
