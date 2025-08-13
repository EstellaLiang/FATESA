<template>
  <div class="task-config-container">
    <h2>分析任务配置</h2>

    <div class="config-form">
      <div class="form-section basic-params">
        <h3>基础参数</h3>

        <div class="form-group">
          <label>任务名称</label>
          <input
              type="text"
              v-model="taskName"
              placeholder="例如: CA1234_20250807_疲劳监测"
          >
          <p class="hint">推荐采用"航班号_日期_分析类型"的命名规范</p>
        </div>

        <div class="form-group">
          <label>分析模式</label>
          <div class="mode-options">
            <div
                class="mode-option"
                :class="{ 'selected': analysisMode === 'fast' }"
                @click="analysisMode = 'fast'"
            >
              <h4>快速分析模式</h4>
              <p>YOLOv8面部检测 + PFLD关键点定位</p>
              <p class="speed">处理速度: 1:1实时</p>
            </div>

            <div
                class="mode-option"
                :class="{ 'selected': analysisMode === 'deep' }"
                @click="analysisMode = 'deep'"
            >
              <h4>深度分析模式</h4>
              <p>ResNet-152 3DCNN + LSTM时序建模</p>
              <p class="speed">处理速度: 1:3实时</p>
              <p class="accuracy">精度提升: 12%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section advanced-options">
        <h3>高级选项 <span class="section-hint">（专业人员使用）</span></h3>

        <div class="form-group">
          <label>自定义指标</label>
          <div class="custom-metrics">
            <div class="metric-item" v-for="(metric, index) in customMetrics" :key="index">
              <input
                  type="text"
                  v-model="metric.name"
                  placeholder="指标名称"
              >
              <select v-model="metric.type">
                <option value="count">计数</option>
                <option value="duration">持续时间</option>
                <option value="frequency">频率</option>
              </select>
              <textarea
                  v-model="metric.definition"
                  placeholder="输入自然语言描述或SQL-like查询语句"
              ></textarea>
              <button
                  class="remove-btn"
                  @click="removeMetric(index)"
              >
                &times;
              </button>
            </div>

            <button class="add-btn" @click="addMetric">
              + 添加自定义指标
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>对比组设置</label>
          <div class="comparison-settings">
            <div class="comparison-option">
              <label>
                <input
                    type="checkbox"
                    v-model="enableComparison"
                >
                启用对比分析
              </label>

              <div class="comparison-content" v-if="enableComparison">
                <div class="comparison-selector">
                  <select v-model="comparisonType">
                    <option value="sameAircraft">同机型飞行员</option>
                    <option value="sameRoute">同航线飞行员</option>
                    <option value="custom">自定义选择</option>
                  </select>

                  <div class="comparison-list" v-if="comparisonType === 'custom'">
                    <div
                        class="pilot-item"
                        v-for="pilot in availablePilots"
                        :key="pilot.id"
                    >
                      <label>
                        <input
                            type="checkbox"
                            v-model="selectedPilots"
                            :value="pilot.id"
                        >
                        {{ pilot.name }} ({{ pilot.flightCount }}次飞行)
                      </label>
                    </div>
                  </div>
                </div>

                <div class="comparison-preview">
                  <h4>对比报告预览</h4>
                  <div class="preview-content">
                    <div class="preview-item">
                      <span class="preview-label">对比组数量</span>
                      <span class="preview-value">{{ comparisonPreview.count }}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">平均差异</span>
                      <span class="preview-value">{{ comparisonPreview.avgDiff }}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">显著性水平</span>
                      <span class="preview-value">{{ comparisonPreview.significance }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="save-btn" @click="saveAsTemplate">
        保存为模板
      </button>
      <button class="start-btn" @click="startAnalysis">
        下一步
      </button>
    </div>
    <!-- 模板保存对话框 -->
    <div class="modal-overlay" v-if="showTemplateModal">
      <div class="template-modal">
        <h3>保存配置模板</h3>

        <div class="modal-content">
          <div class="form-group">
            <label>模板名称</label>
            <input type="text" v-model="templateName">
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea v-model="templateDescription"></textarea>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeModal">
              取消
            </button>
            <button class="confirm-btn" @click="confirmSaveTemplate">
              确认保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';

// 基础参数
const taskName = ref();
const analysisMode = ref<'fast' | 'deep'>('fast');

// 自定义指标
interface Metric {
  name: string;
  type: string;
  definition: string;
}

const closeModal = () => {
  showTemplateModal.value = false;
  templateName.value = '';  // 清空输入
  templateDescription.value = '';  // 清空输入
};

const customMetrics = ref<Metric[]>([
  {name: '打哈欠次数', type: 'count', definition: '统计每分钟打哈欠次数'},
  // {name: '单手操作时间', type: 'duration', definition: '计算单手操作控制杆的总时间'}
]);

// 对比组设置
const enableComparison = ref(false);
const comparisonType = ref('sameAircraft');
const availablePilots = ref([
  {id: 'p1', name: '张三', flightCount: 24},
  {id: 'p2', name: '李四', flightCount: 18},
  {id: 'p3', name: '王五', flightCount: 32}
]);
const selectedPilots = ref<string[]>(['p1', 'p2']);

// 模板保存
const showTemplateModal = ref(false);
const templateName = ref('');
const templateDescription = ref('');

// 计算属性
const comparisonPreview = computed(() => {
  if (!enableComparison.value) {
    return {count: 0, avgDiff: 'N/A', significance: 'N/A'};
  }

  let count = 0;
  if (comparisonType.value === 'custom') {
    count = selectedPilots.value.length;
  } else {
    count = comparisonType.value === 'sameAircraft' ? 15 : 8;
  }

  return {
    count,
    avgDiff: count > 0 ? '12.5%' : 'N/A',
    significance: count > 0 ? 'p < 0.05' : 'N/A'
  };
});

// 方法
const addMetric = () => {
  customMetrics.value.push({
    name: '',
    type: 'count',
    definition: ''
  });
};

const removeMetric = (index: number) => {
  customMetrics.value.splice(index, 1);
};

const saveAsTemplate = () => {
  showTemplateModal.value = true;
};

const confirmSaveTemplate = () => {
  // 实际应用中这里会保存模板
  showTemplateModal.value = false;
};

// const startAnalysis = () => {
//   // 实际应用中这里会开始分析任务
//   console.log('Starting analysis with config:', {
//     taskName: taskName.value,
//     analysisMode: analysisMode.value,
//     customMetrics: customMetrics.value,
//     comparison: enableComparison.value ? {
//       type: comparisonType.value,
//       selectedPilots: comparisonType.value === 'custom' ? selectedPilots.value : undefined
//     } : undefined
//   });
// };

// 在 script setup 部分添加
const emit = defineEmits(['next']);

// 修改原 startAnalysis 方法
const startAnalysis = () => {
  if (taskName.value) {
    emit('next');  // 添加此行
  } else {
    ElMessage.warning("请输入任务名称")
  }

};
</script>

<style lang="scss" scoped>
$primary-color: #00f2fe; // 科技蓝
$secondary-color: #4facfe; // 渐变蓝
$accent-color: #00ff9d; // 霓虹绿
$text-color: rgba(255, 255, 255, 0.85); // 主文字
$text-secondary: rgba(255, 255, 255, 0.6); // 次要文字
$bg-color: #0a1a2a; // 深蓝背景
$card-bg: rgba(16, 42, 67, 0.6); // 卡片背景
$border-color: rgba(0, 242, 254, 0.3); // 边框颜色

.task-config-container {
  padding: 1rem;
  border-radius: 8px;
  background: $bg-color;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: $text-color;

  h2 {
    margin-top: 0;
    color: $primary-color;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-align: center;
  }
}

.config-form {
  margin-top: 1rem;
  display: flex;
  gap: 20px;
}

.form-section {
  margin-bottom: 2rem;
  padding-right: 1rem;
  border-right: 1px dashed $border-color;
  flex: 1;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-right: none;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: $secondary-color;
    font-weight: 500;

    .section-hint {
      font-size: 0.9rem;
      color: $text-secondary;
      font-weight: normal;
    }
  }
}

.form-group {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: $text-color;
    font-weight: 500;
  }

  input[type="text"], textarea, select {
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

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .hint {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: $text-secondary;
  }
}

.mode-options {
  display: flex;
  gap: 1.5rem;

  .mode-option {
    flex: 1;
    padding: 1.5rem;
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &.selected {
      border-color: $accent-color;
      background: rgba(16, 42, 67, 0.9);
      box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
    }

    h4 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      color: $primary-color;
    }

    p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: $text-secondary;
    }

    .speed {
      font-weight: 500;
      color: $secondary-color;
    }

    .accuracy {
      font-weight: 500;
      color: $accent-color;
    }
  }
}

.custom-metrics {
  .metric-item {
    position: relative;
    margin-bottom: 1rem;
    padding: 1rem;
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 4px;

    input, select {
      margin-bottom: 0.5rem;
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1rem;
      line-height: 1;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 10px rgba(255, 65, 108, 0.5);
      }
    }
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background: $card-bg;
    border: 1px dashed $border-color;
    border-radius: 4px;
    color: $text-color;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;

    &:hover {
      border-color: $accent-color;
      color: $accent-color;
      background: rgba(16, 42, 67, 0.8);
    }
  }
}

.comparison-settings {
  .comparison-option {
    label {
      display: flex;
      align-items: center;
      cursor: pointer;

      input {
        margin-right: 0.5rem;
      }
    }
  }

  .comparison-content {
    margin-top: 1rem;
    padding: 1rem;
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 4px;
  }

  .comparison-selector {
    select {
      width: 100%;
      margin-bottom: 1rem;
    }
  }

  .comparison-list {
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: rgba(10, 26, 42, 0.8);
    border-radius: 4px;
    border: 1px solid $border-color;

    .pilot-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      label {
        display: flex;
        align-items: center;
        font-weight: normal;
        cursor: pointer;

        input {
          margin-right: 0.5rem;
        }
      }
    }
  }

  .comparison-preview {
    margin-top: 1.5rem;

    h4 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: $primary-color;
    }

    .preview-content {
      display: flex;
      gap: 1.5rem;

      .preview-item {
        flex: 1;
        padding: 0.75rem;
        background: $card-bg;
        border: 1px solid $border-color;
        border-radius: 4px;
        text-align: center;

        .preview-label {
          display: block;
          font-size: 0.8rem;
          color: $text-secondary;
          margin-bottom: 0.25rem;
        }

        .preview-value {
          display: block;
          font-weight: 500;
          color: $accent-color;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;

  .save-btn {
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

  .start-btn {
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
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.template-modal {
  width: 500px;
  background: $card-bg;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.2);
  border: 1px solid $border-color;

  h3 {
    margin: 0;
    padding: 1.5rem;
    border-bottom: 1px solid $border-color;
    color: $primary-color;
    font-weight: 500;
  }

  .modal-content {
    padding: 1.5rem;

    .form-group {
      margin-bottom: 1.5rem;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid $border-color;

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

    .confirm-btn {
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
      }
    }
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
</style>
