<template>
  <div class="data-import-container">
    <h2>数据导入</h2>

    <div class="import-methods">
      <div class="method-card" :class="{ 'active': activeMethod === 'upload' }"
           @click="activeMethod = 'upload'">
        <div class="method-icon">
          <i class="icon-upload"></i>
        </div>
        <h3>本地文件上传</h3>
        <p>拖拽ZIP压缩包到指定区域</p>
      </div>

      <div class="method-card" :class="{ 'active': activeMethod === 'database' }" @click="activeMethod = 'database'">
        <div class="method-icon">
          <i class="icon-database"></i>
        </div>
        <h3>数据库检索</h3>
        <p>通过多维度条件筛选数据</p>
      </div>

      <div class="method-card" :class="{ 'active': activeMethod === 'realtime' }" @click="activeMethod = 'realtime'">
        <div class="method-icon">
          <i class="icon-realtime"></i>
        </div>
        <h3>实时监测转存</h3>
        <p>截取历史片段转为分析任务</p>
      </div>
    </div>

    <div class="method-content">
      <!-- 文件上传 -->
      <div v-if="activeMethod === 'upload'" class="upload-section">
        <div
            class="drop-zone"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop="handleDrop"
            @click="triggerFileInput"
            :class="{ 'drag-over': dragOver }"
        >
          <div class="drop-content">
            <i class="icon-cloud-upload"></i>
            <p>拖拽文件到此处上传</p>
            <p class="hint">支持ZIP格式（包含视频、眼动CSV、飞行参数JSON）</p>
          </div>
        </div>
        <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            style="display: none"
            accept=".zip,video/*">

        <div class="progress-section" v-if="uploadProgress > 0">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}%</span>
          <!--          <button v-if="uploadProgress < 100" class="cancel-btn" @click="cancelUpload">取消</button>-->
        </div>

        <div class="file-list" v-if="uploadedFiles.length > 0">
          <div v-for="(file, index) in uploadedFiles" :key="file.name" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-status" :class="file.status">{{ file.statusText }}</span>
            <button class="delete-btn" @click="removeFile(index)" v-if="file.status === 'success'">删除</button>
          </div>
        </div>
      </div>

      <!-- 数据库检索 -->
      <div v-if="activeMethod === 'database'" class="database-section">
        <div class="search-filters">
          <div class="filter-row">
            <div class="filter-item">
              <label>日期范围</label>
              <div class="date-range-picker">
                <input type="date" v-model="dateRange.start">
                <span>至</span>
                <input type="date" v-model="dateRange.end">
              </div>
            </div>

            <div class="filter-item">
              <label>航班号</label>
              <input type="text" v-model="flightNumber" placeholder="如CA1234">
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-item">
              <label>机型</label>
              <select v-model="selectedAircraft">
                <option value="">全部</option>
                <option v-for="type in aircraftTypes" :value="type">{{ type }}</option>
              </select>
            </div>

            <div class="filter-item">
              <label>飞行员</label>
              <select v-model="selectedPilot">
                <option value="">全部</option>
                <option v-for="pilot in pilotList" :value="pilot.id">{{ pilot.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <button class="search-btn" @click="searchDatabase">检索数据</button>

        <div class="search-results" v-if="searchResults.length > 0">
          <div class="result-header">
            <span class="result-col">日期</span>
            <span class="result-col">航班号</span>
            <span class="result-col">飞行员</span>
            <span class="result-col">数据量</span>
            <span class="result-col">操作</span>
          </div>

          <div v-for="result in searchResults" :key="result.id" class="result-item">
            <span class="result-col">{{ result.date }}</span>
            <span class="result-col">{{ result.flightNumber }}</span>
            <span class="result-col">{{ result.pilot }}</span>
            <span class="result-col">{{ formatFileSize(result.size) }}</span>
            <span class="result-col">
              <button class="import-btn" @click="importFromDatabase(result.id)">导入</button>
            </span>
          </div>
        </div>
      </div>

      <!-- 实时监测转存 -->
      <div v-if="activeMethod === 'realtime'" class="realtime-section">
        <div class="time-selector">
          <label>选择时间段</label>
          <div class="time-inputs">
            <input type="datetime-local" v-model="realtimeStart">
            <span>至</span>
            <input type="datetime-local" v-model="realtimeEnd">
          </div>
          <p class="duration-hint">最小截取时长: 5分钟</p>
        </div>

        <div class="realtime-preview">
          <div class="preview-header">
            <h4>实时监测预览</h4>
            <div class="preview-controls">
              <button class="control-btn" @click="playPreview">
                <i class="icon-play"></i>
              </button>
              <button class="control-btn" @click="pausePreview">
                <i class="icon-pause"></i>
              </button>
            </div>
          </div>

          <div class="preview-content">
            <div class="video-preview">
              <div class="video-placeholder"></div>
              <div class="timeline">
                <div class="timeline-progress" :style="{ width: previewProgress + '%' }"></div>
              </div>
            </div>

            <div class="data-overlay">
              <div class="overlay-item">
                <span class="overlay-label">眼动数据</span>
                <div class="overlay-status" :class="{ 'active': eyeDataActive }"></div>
              </div>
              <div class="overlay-item">
                <span class="overlay-label">飞行参数</span>
                <div class="overlay-status" :class="{ 'active': flightDataActive }"></div>
              </div>
            </div>
          </div>
        </div>

        <button
            class="save-btn"
            @click="saveRealtimeClip"
            :disabled="!canSaveClip"
        >
          保存为分析任务
        </button>
      </div>
    </div>

    <!-- 数据预处理 -->
    <div class="preprocessing-section" v-if="showPreprocessing">
      <h3>数据预处理</h3>

      <div class="preprocessing-tabs">
        <button
            class="tab-btn"
            :class="{ 'active': activeTab === 'sync' }"
            @click="activeTab = 'sync'"
        >
          时间同步
        </button>
        <button
            class="tab-btn"
            :class="{ 'active': activeTab === 'quality' }"
            @click="activeTab = 'quality'"
        >
          质量检测
        </button>
        <button
            class="tab-btn"
            :class="{ 'active': activeTab === 'enhance' }"
            @click="activeTab = 'enhance'"
        >
          数据增强
        </button>
      </div>

      <div class="tab-content">
        <!-- 时间同步 -->
        <div v-if="activeTab === 'sync'" class="sync-content">
          <div class="sync-visualization">
            <div class="sync-item">
              <span class="sync-label">视频数据 (30Hz)</span>
              <div class="sync-bar"></div>
            </div>
            <div class="sync-item">
              <span class="sync-label">眼动数据 (120Hz)</span>
              <div class="sync-bar"></div>
            </div>
            <div class="sync-item">
              <span class="sync-label">飞行参数 (1Hz)</span>
              <div class="sync-bar"></div>
            </div>
          </div>

          <div class="sync-info">
            <p>同步状态: <span class="status-success">已完成</span></p>
            <p>时间误差: <span class="error-value">±2.8ms</span></p>
          </div>
        </div>

        <!-- 质量检测 -->
        <div v-if="activeTab === 'quality'" class="quality-content">
          <div class="quality-chart">
            <div class="chart-container">
              <div class="chart-bar video" :style="{ width: videoQuality + '%' }">
                <span class="chart-label">视频质量: {{ videoQuality }}%</span>
              </div>
            </div>
            <div class="chart-container">
              <div class="chart-bar eye" :style="{ width: eyeQuality + '%' }">
                <span class="chart-label">眼动数据质量: {{ eyeQuality }}%</span>
              </div>
            </div>
            <div class="chart-container">
              <div class="chart-bar flight" :style="{ width: flightQuality + '%' }">
                <span class="chart-label">飞行参数质量: {{ flightQuality }}%</span>
              </div>
            </div>
          </div>

          <div class="quality-issues">
            <h4>问题区段</h4>
            <div class="issue-list">
              <div class="issue-item video">
                <span class="issue-time">00:12:34 - 00:12:36</span>
                <span class="issue-desc">视频丢帧 (2秒)</span>
                <button class="issue-action">排除</button>
              </div>
              <div class="issue-item eye">
                <span class="issue-time">00:23:45 - 00:23:47</span>
                <span class="issue-desc">眼动信号中断 (2秒)</span>
                <button class="issue-action">排除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据增强 -->
        <div v-if="activeTab === 'enhance'" class="enhance-content">
          <div class="enhance-options">
            <div class="option-item">
              <label>
                <input type="checkbox" v-model="enableVideoDenoise">
                视频去噪
              </label>
              <p class="option-desc">使用时域空域联合滤波算法消除低光照噪点</p>
            </div>

            <div class="option-item">
              <label>
                <input type="checkbox" v-model="enableEyeInterpolation">
                眼动数据插值
              </label>
              <p class="option-desc">基于注意力转移模型修复短时信号丢失</p>
            </div>
          </div>

          <div class="enhance-preview">
            <div class="preview-container">
              <div class="preview-title">原始数据</div>
              <div class="preview-original"></div>
            </div>
            <div class="preview-container">
              <div class="preview-title">处理后</div>
              <div class="preview-enhanced"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="preprocessing-actions">
        <button class="process-btn" @click="applyPreprocessing">应用预处理</button>
        <button class="cancel-btn" @click="cancelPreprocessing">取消</button>
      </div>
    </div>
    <div class="navigation-buttons">
      <button class="prev-btn" @click="emit('prev')">上一步</button>
      <button class="next-btn" @click="handleAnalysis">开始检测</button>
    </div>
    <!-- 遮罩层 -->
    <div v-if="isAnalyzing" class="tech-loading-mask">
      <div class="tech-loading-content">
        <div class="tech-circle">
          <div class="tech-circle-inner"></div>
          <div class="tech-circle-outer"></div>
          <div class="tech-circle-pulse"></div>
        </div>

        <div class="tech-progress-text">
          <div class="tech-processing-step" v-for="(step, index) in processingSteps"
               :key="index" :class="{active: currentStep === index}">
            <span class="step-icon">{{ step.completed ? '✓' : '⌛' }}</span>
            <span class="step-text">{{ step.text }}</span>
            <span class="step-percent" v-if="step.percent">{{ step.percent.toFixed(2) }}%</span>
          </div>
        </div>

        <div class="tech-stats">
          <div class="tech-stat-item">
            <span class="stat-label">处理速度:</span>
            <span class="stat-value">{{ processingSpeed }} FPS</span>
          </div>
          <div class="tech-stat-item">
            <span class="stat-label">剩余时间:</span>
            <span class="stat-value">{{ remainingTime }}</span>
          </div>
        </div>

        <div class="tech-binary-code">
          <div v-for="(line, i) in binaryLines" :key="i" class="binary-line">
            {{ line }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {Discount} from "@element-plus/icons-vue";
import VideoAPI from "@/api/video";

// 数据导入方法
const activeMethod = ref<'upload' | 'database' | 'realtime'>('upload');
const dragOver = ref(false);
const uploadProgress = ref(0);
const uploadedFiles = ref<Array<{
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  statusText: string
  file?: File  // 添加File对象引用
}>>([]);
// 数据库检索
const dateRange = ref({
  start: '',
  end: ''
});
const flightNumber = ref('');
const selectedAircraft = ref('');
const selectedPilot = ref('');
const aircraftTypes = ref(['A320', 'B737', 'A350', 'B787']);
const pilotList = ref([
  {id: 'p1', name: '张三'},
  {id: 'p2', name: '李四'},
  {id: 'p3', name: '王五'}
]);
const searchResults = ref<Array<{
  id: string,
  date: string,
  flightNumber: string,
  pilot: string,
  size: number
}>>([]);

// 实时监测转存
const realtimeStart = ref('');
const realtimeEnd = ref('');
const previewProgress = ref(0);
const eyeDataActive = ref(true);
const flightDataActive = ref(true);

// 数据预处理
const showPreprocessing = ref(false);
const activeTab = ref<'sync' | 'quality' | 'enhance'>('sync');
const videoQuality = ref(92);
const eyeQuality = ref(85);
const flightQuality = ref(98);
const enableVideoDenoise = ref(false);
const enableEyeInterpolation = ref(false);

// 计算属性
const canSaveClip = computed(() => {
  return realtimeStart.value && realtimeEnd.value;
});

const fileInput = ref<HTMLInputElement>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    startUpload(file);
  }
};

// 方法
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragOver.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    // 检查文件类型
    if (!file.type.match(/video\/.*|application\/zip/)) {
      ElMessage.error('请上传视频文件或ZIP压缩包');
      return;
    }
    startUpload(file);
  }
};

const startUpload = (file: File) => {
  uploadProgress.value = 0;
  uploadedFiles.value = [{
    name: file.name,
    size: file.size,
    status: 'uploading',
    statusText: '上传中...',
    file: file  // 保存File对象引用
  }];

  // 模拟上传过程
  const interval = setInterval(() => {
    uploadProgress.value += 5;
    if (uploadProgress.value >= 100) {
      clearInterval(interval);
      uploadedFiles.value[0].status = 'success';
      uploadedFiles.value[0].statusText = '上传成功';
      showPreprocessing.value = true;
    }
  }, 200);
};

const cancelUpload = () => {
  uploadProgress.value = 0;
  uploadedFiles.value = [];
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const searchDatabase = () => {
  // 模拟搜索
  searchResults.value = [
    {
      id: 'db1',
      date: '2023-01-15',
      flightNumber: 'CA1234',
      pilot: '张三',
      size: 1024 * 1024 * 5 // 5MB
    },
    {
      id: 'db2',
      date: '2023-01-16',
      flightNumber: 'MU5678',
      pilot: '李四',
      size: 1024 * 1024 * 8 // 8MB
    }
  ];
};

const importFromDatabase = (id: string) => {
  // 模拟导入
  const result = searchResults.value.find(r => r.id === id);
  if (result) {
    uploadedFiles.value = [{
      name: `${result.flightNumber}_${result.date}.zip`,
      size: result.size,
      status: 'success',
      statusText: '导入成功'
    }];
    showPreprocessing.value = true;
  }
};

const playPreview = () => {
  // 模拟播放
  const interval = setInterval(() => {
    previewProgress.value += 1;
    if (previewProgress.value >= 100) {
      clearInterval(interval);
    }
  }, 100);
};

const pausePreview = () => {
  // 实际应用中这里会停止播放
};

const saveRealtimeClip = () => {
  // 模拟保存
  uploadedFiles.value = [{
    name: `realtime_${realtimeStart.value}_to_${realtimeEnd.value}.zip`,
    size: 1024 * 1024 * 3, // 3MB
    status: 'success',
    statusText: '保存成功'
  }];
  showPreprocessing.value = true;
};

const applyPreprocessing = () => {
  // 应用预处理
  showPreprocessing.value = false;
  // 实际应用中这里会导航到任务配置页面
};

const cancelPreprocessing = () => {
  showPreprocessing.value = false;
};

const emit = defineEmits(['next', 'prev']);
const videoId = ref<number>();
const handleAnalysis = async () => {
  try {
    if (uploadedFiles.value.length === 0) {
      ElMessage.warning('请先上传或选择要分析的文件');
      return;
    }

    isAnalyzing.value = true;
    startAnalysis();

    // 模拟视频ID赋值
    videoId.value = Math.floor(Math.random() * 1000) + 1;

    // 设置超时自动完成（真实场景应等待API响应）
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
      }
      if (currentStep.value < processingSteps.value.length) {
        // 强制完成所有步骤
        processingSteps.value.forEach(step => {
          step.percent = 100;
          step.completed = true;
        });
        currentStep.value = processingSteps.value.length;
      }
      isAnalyzing.value = false;
      emit('next', videoId.value);
    }, 30000); // 30秒后自动完成

  } catch (error: any) {
    console.error('分析任务创建失败:', error);
    isAnalyzing.value = false;
    if (interval) {
      clearInterval(interval);
    }
    ElMessage.error(`分析任务创建失败: ${error.message || '未知错误'}`);
  }
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
  uploadProgress.value = 0;
};

interface ProcessingStep {
  text: string
  completed: boolean
  percent: number
}

const isAnalyzing = ref(false)
const currentStep = ref(0)
const processingSteps = ref<ProcessingStep[]>([
  {text: "正在加载模型文件", completed: false, percent: 0},
  {text: "正在进行脸部识别", completed: false, percent: 0},
  {text: "正在进行双目眼球分割", completed: false, percent: 0},
  {text: "正在进行疲劳检测分析", completed: false, percent: 0},
  {text: "正在生成分析报告", completed: false, percent: 0}
])
const processingSpeed = ref("0")
const remainingTime = ref("计算中...")
const binaryLines = ref<string[]>([])
const binaryChars = "01"
let interval: number | null = null

const generateBinaryCode = () => {
  binaryLines.value = [];
  const lineCount = Math.floor(Math.random() * 6) + 8; // 8-13行
  const lineLength = Math.floor(Math.random() * 20) + 30; // 30-49字符

  for (let i = 0; i < lineCount; i++) {
    let line = '';
    for (let j = 0; j < lineLength; j++) {
      line += Math.random() > 0.5 ? '1' : '0';
    }
    binaryLines.value.push(line);
  }

  const updateInterval = setInterval(() => {
    if (!isAnalyzing.value) {
      clearInterval(updateInterval);
      return;
    }

    binaryLines.value = binaryLines.value.map(line => {
      return line.split('').map(char => {
        return Math.random() > 0.98 ?
            (char === '1' ? '0' : '1') :
            char;
      }).join('');
    });
  }, 200);
}

const updateProcessing = () => {
  if (currentStep.value >= processingSteps.value.length) {
    if (interval) clearInterval(interval);
    return;
  }

  const step = processingSteps.value[currentStep.value];

  const increment = Math.random() * (currentStep.value === 0 ? 10 : 5) + 5;
  step.percent = Math.min(step.percent + increment, 100);

  processingSpeed.value = (Math.random() * 25 + 10).toFixed(1);

  if (step.percent < 100) {
    const remainingPercent = 100 - step.percent;
    const estimatedSeconds = Math.max(1, Math.floor(remainingPercent / increment * 1.5));
    remainingTime.value = `${estimatedSeconds}秒`;
  } else {
    step.completed = true;
    currentStep.value++;
    // 重置新步骤的进度
    if (currentStep.value < processingSteps.value.length) {
      processingSteps.value[currentStep.value].percent = 0;
    }
  }

  // 如果所有步骤完成，延迟1秒关闭
  if (currentStep.value >= processingSteps.value.length) {
    setTimeout(() => {
      isAnalyzing.value = false;
      resetProcessing();
      emit('next', videoId.value);
    }, 1000);
  }
}

const resetProcessing = () => {
  currentStep.value = 0;
  processingSteps.value.forEach(step => {
    step.completed = false;
    step.percent = 0;
  });
}

const startAnalysis = () => {
  isAnalyzing.value = true;
  currentStep.value = 0;
  resetProcessing();
  generateBinaryCode();

  // 启动进度更新
  interval = setInterval(updateProcessing, 300);
}

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});

</script>

<style lang="scss" scoped>
$primary-color: #00f2fe; // 科技蓝
$secondary-color: #4facfe; // 渐变蓝
$accent-color: #00ff9d; // 霓虹绿
$danger-color: #ff416c; // 警示红
$warning-color: #ffc107; // 警告黄
$text-color: rgba(255, 255, 255, 0.85); // 主文字
$text-secondary: rgba(255, 255, 255, 0.6); // 次要文字
$bg-color: #0a1a2a; // 深蓝背景
$card-bg: rgba(16, 42, 67, 0.6); // 卡片背景
$border-color: rgba(0, 242, 254, 0.3); // 边框颜色

.data-import-container {
  padding: 1.5rem;
  background: $bg-color;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  color: $text-color;

  h2 {
    margin-top: 0;
    color: $primary-color;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

.import-methods {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.method-card {
  flex: 1;
  padding: 1.5rem;
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
    border-color: $accent-color;
  }

  .method-icon {
    font-size: 2rem;
    color: $accent-color;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0.5rem 0;
    color: $text-color;
  }

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 0.9rem;
  }

  &.active {
    border-color: $accent-color;
    background: rgba(0, 255, 157, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);

    h3, p {
      color: $text-color;
    }

    .method-icon {
      color: $accent-color;
    }
  }
}

.method-content {
  margin-top: 2rem;
  width: 100%;
}

/* 文件上传样式 */
.upload-section {
  .drop-zone {
    border: 2px dashed $border-color;
    border-radius: 8px;
    padding: 3rem;
    text-align: center;
    transition: all 0.3s;
    background: rgba(16, 42, 67, 0.4);

    &.drag-over {
      border-color: $accent-color;
      background: rgba(0, 255, 157, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
    }

    .drop-content {
      i {
        font-size: 3rem;
        color: $accent-color;
      }

      p {
        margin: 1rem 0 0;
        font-size: 1.1rem;
        color: $text-color;
      }

      .hint {
        font-size: 0.9rem;
        color: $text-secondary;
      }
    }
  }

  .progress-section {
    display: flex;
    align-items: center;
    margin-top: 1.5rem;

    .progress-bar {
      flex: 1;
      height: 8px;
      background: rgba(16, 42, 67, 0.8);
      border-radius: 4px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, $primary-color, $accent-color);
        transition: width 0.3s;
      }
    }

    .progress-text {
      margin: 0 1rem;
      font-size: 0.9rem;
      color: $text-secondary;
    }

    .cancel-btn {
      padding: 0.25rem 0.75rem;
      background: transparent;
      border: 1px solid $danger-color;
      color: $danger-color;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 65, 108, 0.1);
      }
    }
  }

  .file-list {
    margin-top: 1.5rem;
    border: 1px solid $border-color;
    border-radius: 8px;
    overflow: hidden;
    background: $card-bg;

    .file-item {
      display: flex;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid $border-color;
      align-items: center;

      &:last-child {
        border-bottom: none;
      }

      .file-name {
        flex: 1;
        color: $text-color;
      }

      .file-size {
        width: 100px;
        text-align: right;
        color: $text-secondary;
        font-size: 0.9rem;
      }

      .file-status {
        width: 100px;
        text-align: right;
        font-size: 0.9rem;

        &.success {
          color: $accent-color;
        }

        &.uploading {
          color: $primary-color;
        }
      }
    }
  }
}

.delete-btn {
  background: none;
  border: none;
  color: $danger-color;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: all 0.3s;

  &:hover {
    color: lighten($danger-color, 10%);
  }

  .icon-delete {
    font-size: 1rem;
  }
}

/* 数据库检索样式 */
.database-section {
  .search-filters {
    background: $card-bg;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid $border-color;

    .filter-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .filter-item {
      flex: 1;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: $text-color;
      }

      input, select {
        width: 100%;
        padding: 0.5rem;
        background: rgba(10, 26, 42, 0.8);
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: 0.9rem;
        color: $text-color;
        transition: all 0.3s;

        &:focus {
          outline: none;
          border-color: $accent-color;
          box-shadow: 0 0 0 2px rgba(0, 255, 157, 0.2);
        }
      }
    }

    .date-range-picker {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input {
        flex: 1;
      }
    }
  }

  .search-btn {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, $primary-color, $accent-color);
    color: $bg-color;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 15px rgba(0, 255, 157, 0.5);
    }
  }

  .search-results {
    margin-top: 2rem;
    border: 1px solid $border-color;
    border-radius: 8px;
    overflow: hidden;
    background: $card-bg;

    .result-header, .result-item {
      display: flex;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid $border-color;
      align-items: center;

      .result-col {
        flex: 1;
        color: $text-color;

        &:last-child {
          flex: 0.5;
          text-align: right;
        }
      }
    }

    .result-header {
      background: rgba(16, 42, 67, 0.8);
      font-weight: 500;
    }

    .result-item {
      &:last-child {
        border-bottom: none;
      }

      .import-btn {
        padding: 0.25rem 0.75rem;
        background: $accent-color;
        color: $bg-color;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
        }
      }
    }
  }
}

/* 实时监测转存样式 */
.realtime-section {
  .time-selector {
    background: $card-bg;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid $border-color;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: $text-color;
    }

    .time-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input {
        flex: 1;
        padding: 0.5rem;
        background: rgba(10, 26, 42, 0.8);
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: 0.9rem;
        color: $text-color;
      }
    }

    .duration-hint {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: $text-secondary;
    }
  }

  .realtime-preview {
    border: 1px solid $border-color;
    border-radius: 8px;
    overflow: hidden;
    background: $card-bg;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(16, 42, 67, 0.8);
      border-bottom: 1px solid $border-color;

      h4 {
        margin: 0;
        color: $primary-color;
      }

      .preview-controls {
        display: flex;
        gap: 0.5rem;

        .control-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 26, 42, 0.8);
          border: 1px solid $border-color;
          border-radius: 4px;
          cursor: pointer;
          color: $text-color;
          transition: all 0.3s;

          &:hover {
            border-color: $accent-color;
            color: $accent-color;
          }
        }
      }
    }

    .preview-content {
      display: flex;

      .video-preview {
        flex: 1;
        padding: 1rem;

        .video-placeholder {
          height: 300px;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          border: 1px solid $border-color;
          background-image: url("@/assets/img/driver3.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .timeline {
          height: 4px;
          background: rgba(10, 26, 42, 0.8);
          border-radius: 2px;
          margin-top: 0.5rem;
          position: relative;
          border: 1px solid $border-color;

          .timeline-progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background: linear-gradient(90deg, $primary-color, $accent-color);
            border-radius: 2px;
          }
        }
      }

      .data-overlay {
        width: 200px;
        padding: 1rem;
        border-left: 1px solid $border-color;

        .overlay-item {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;

          &:last-child {
            margin-bottom: 0;
          }

          .overlay-label {
            flex: 1;
            font-size: 0.9rem;
            color: $text-color;
          }

          .overlay-status {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: $danger-color;
            box-shadow: 0 0 5px $danger-color;

            &.active {
              background-color: $accent-color;
              box-shadow: 0 0 5px $accent-color;
            }
          }
        }
      }
    }
  }

  .save-btn {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, $primary-color, $accent-color);
    color: $bg-color;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 15px rgba(0, 255, 157, 0.5);
    }

    &:disabled {
      background: $text-secondary;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}

/* 数据预处理样式 */
.preprocessing-section {
  margin-top: 2rem;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 1.5rem;
  background: $card-bg;
  width: 50%;

  h3 {
    margin-top: 0;
    color: $primary-color;
  }

  .preprocessing-tabs {
    display: flex;
    border-bottom: 1px solid $border-color;
    margin-bottom: 1.5rem;

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 0.9rem;
      color: $text-secondary;
      transition: all 0.3s;

      &.active {
        color: $accent-color;
        border-bottom-color: $accent-color;
      }

      &:hover {
        color: $text-color;
      }
    }
  }

  .tab-content {
    min-height: 300px;
  }

  /* 时间同步内容 */
  .sync-content {
    display: flex;
    gap: 2rem;

    .sync-visualization {
      flex: 1;

      .sync-item {
        margin-bottom: 1.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        .sync-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: $text-color;
        }

        .sync-bar {
          height: 20px;
          background: rgba(10, 26, 42, 0.8);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          border: 1px solid $border-color;

          &::after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, $primary-color, $accent-color);
            animation: syncAnimation 2s infinite;
          }
        }
      }
    }

    .sync-info {
      width: 200px;

      p {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        color: $text-color;

        &:last-child {
          margin-bottom: 0;
        }

        .status-success {
          color: $accent-color;
        }

        .error-value {
          color: $primary-color;
        }
      }
    }
  }

  /* 质量检测内容 */
  .quality-content {
    display: flex;
    gap: 2rem;

    .quality-chart {
      flex: 1;

      .chart-container {
        margin-bottom: 1.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        .chart-bar {
          height: 30px;
          border-radius: 4px;
          position: relative;
          transition: width 0.5s;

          &.video {
            background: rgba(0, 255, 157, 0.2);
          }

          &.eye {
            background: rgba(0, 242, 254, 0.2);
          }

          &.flight {
            background: rgba(79, 172, 254, 0.2);
          }

          .chart-label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: $text-color;
            font-size: 0.9rem;
          }
        }
      }
    }

    .quality-issues {
      width: 300px;

      h4 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: $primary-color;
      }

      .issue-list {
        .issue-item {
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          border-radius: 4px;
          font-size: 0.9rem;
          background: rgba(10, 26, 42, 0.8);

          &.video {
            background: rgba(255, 65, 108, 0.1);
            border-left: 3px solid $danger-color;
          }

          &.eye {
            background: rgba(255, 193, 7, 0.1);
            border-left: 3px solid $warning-color;
          }

          .issue-time {
            display: block;
            font-weight: 500;
            margin-bottom: 0.25rem;
            color: $text-color;
          }

          .issue-desc {
            display: block;
            color: $text-secondary;
            margin-bottom: 0.5rem;
          }

          .issue-action {
            padding: 0.25rem 0.5rem;
            background: $card-bg;
            border: 1px solid $border-color;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8rem;
            color: $text-color;
            transition: all 0.3s;

            &:hover {
              border-color: $accent-color;
              color: $accent-color;
            }
          }
        }
      }
    }
  }

  /* 数据增强内容 */
  .enhance-content {
    .enhance-options {
      margin-bottom: 1.5rem;

      .option-item {
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(10, 26, 42, 0.8);
        border-radius: 4px;
        border: 1px solid $border-color;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          display: flex;
          align-items: center;
          font-weight: 500;
          cursor: pointer;
          color: $text-color;

          input {
            margin-right: 0.5rem;
          }
        }

        .option-desc {
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
          color: $text-secondary;
        }
      }
    }

    .enhance-preview {
      display: flex;
      gap: 1.5rem;

      .preview-container {
        flex: 1;

        .preview-title {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: $text-color;
        }

        .preview-original, .preview-enhanced {
          height: 200px;
          background: rgba(10, 26, 42, 0.8);
          border-radius: 4px;
          border: 1px solid $border-color;
        }
      }
    }
  }

  .preprocessing-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;

    .process-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(90deg, $primary-color, $accent-color);
      color: $bg-color;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 15px rgba(0, 255, 157, 0.5);
      }
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      color: $text-color;
      border: 1px solid $border-color;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }
}

.prev-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: $text-color;
  border: 1px solid $border-color;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    background: rgba(0, 242, 254, 0.1);
  }
}

.next-btn {
  margin: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, $primary-color, $accent-color);
  color: #0a1a2a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 157, 0.5);
    transform: translateY(-1px);
  }
}

@keyframes syncAnimation {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(16, 42, 67, 0.5);
}

::-webkit-scrollbar-thumb {
  background: $primary-color;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: $accent-color;
}

.tech-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 20, 40, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: #00f2ff;
  font-family: 'Arial', sans-serif;
  backdrop-filter: blur(2px);
}

.tech-loading-content {
  width: 600px;
  padding: 30px;
  background: rgba(0, 10, 20, 0.7);
  border: 1px solid #00f2ff;
  border-radius: 5px;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.tech-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
}

.tech-circle-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #00f2ff;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.tech-circle-outer {
  position: absolute;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border: 3px solid transparent;
  border-top-color: #00a1ff;
  border-radius: 50%;
  animation: spinReverse 3s linear infinite;
}

.tech-circle-pulse {
  position: absolute;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  background: rgba(0, 242, 255, 0.1);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinReverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

.tech-progress-text {
  margin-bottom: 30px;
}

.tech-processing-step {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 242, 255, 0.2);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tech-processing-step.active {
  opacity: 1;
  font-weight: bold;
}

.tech-processing-step.completed {
  color: #00ff88;
}

.step-icon {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.step-text {
  flex-grow: 1;
}

.step-percent {
  color: #00a1ff;
}

.tech-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  font-size: 14px;
}

.tech-stat-item {
  display: flex;
}

.stat-label {
  margin-right: 10px;
  color: #00a1ff;
}

.stat-value {
  color: #00f2ff;
}

.tech-binary-code {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  background: rgba(0, 10, 20, 0.5);
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(0, 242, 255, 0.5);
  overflow: hidden;
  line-height: 1.2;
}

.binary-line {
  animation: scrollUp 20s linear infinite;
}

@keyframes scrollUp {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
}
</style>
