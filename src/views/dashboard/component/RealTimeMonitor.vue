<template>
  <div class="real-time-monitor">
    <div class="monitor-header">
      <div class="experiment-info">
        <span class="label">实验ID:</span>
        <span class="value">{{ currentExperimentId }}</span>
      </div>
      <div class="experiment-info">
        <span class="label">实验名称:</span>
        <span class="value">{{ currentExperimentName }}</span>
      </div>
      <div class="experiment-info">
        <span class="label">测试人员:</span>
        <span class="value">用户{{ currentUserId }}</span>
      </div>
      <div class="experiment-info">
        <span class="label">实验时间:</span>
        <span class="value">{{ formatTime(currentExperimentTime) }}</span>
      </div>
    </div>

    <div class="monitor-content">
      <div class="data-section">
        <h3 class="data-title">视线坐标</h3>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">X坐标</span>
            <span class="data-value">{{ currentData.sight_x.toFixed(2) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Y坐标</span>
            <span class="data-value">{{ currentData.sight_y.toFixed(2) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Z坐标</span>
            <span class="data-value">{{ currentData.sight_z.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="data-section">
        <h3 class="data-title">注视落点</h3>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">X坐标</span>
            <span class="data-value">{{ currentData.gaze_x.toFixed(2) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Y坐标</span>
            <span class="data-value">{{ currentData.gaze_y.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="data-section">
        <h3 class="data-title">其他数据</h3>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">注视对象ID</span>
            <span class="data-value">{{ currentData.gaze_object_id }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">瞳孔直径(mm)</span>
            <span class="data-value">{{ currentData.pupil_diameter.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="visualization-section">
        <div class="gaze-visualization">
          <div class="visualization-title">注视点可视化</div>
          <div class="heatmap-container">
            <div class="heatmap-placeholder">
              <div
                  class="gaze-point"
                  :style="{
                  left: `${normalizedGazeX}%`,
                  top: `${normalizedGazeY}%`
                }"
              ></div>
              <div class="object-marker" style="left: 20%; top: 30%;">1</div>
              <div class="object-marker" style="left: 70%; top: 20%;">2</div>
              <div class="object-marker" style="left: 40%; top: 60%;">3</div>
              <div class="object-marker" style="left: 80%; top: 70%;">4</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-history">
      <h3 class="history-title">最近数据记录</h3>
      <div class="history-table">
        <div class="table-header">
          <div class="header-cell">时间</div>
          <div class="header-cell">视线X</div>
          <div class="header-cell">视线Y</div>
          <div class="header-cell">注视X</div>
          <div class="header-cell">注视Y</div>
          <div class="header-cell">瞳孔</div>
        </div>
        <div class="table-body">
          <div
              v-for="(record, index) in dataHistory"
              :key="index"
              class="table-row"
          >
            <div class="table-cell">{{ formatTimeShort(record.timestamp) }}</div>
            <div class="table-cell">{{ record.sight_x.toFixed(2) }}</div>
            <div class="table-cell">{{ record.sight_y.toFixed(2) }}</div>
            <div class="table-cell">{{ record.gaze_x.toFixed(2) }}</div>
            <div class="table-cell">{{ record.gaze_y.toFixed(2) }}</div>
            <div class="table-cell">{{ record.pupil_diameter.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'

interface EyeTrackingData {
  experiment_id: number
  user_id: number
  sight_x: number
  sight_y: number
  sight_z: number
  gaze_x: number
  gaze_y: number
  gaze_object_id: number
  pupil_diameter: number
  timestamp: Date
}

// 当前实验信息
const currentExperimentId = ref(1)
const currentExperimentName = ref('飞行员视线追踪实验')
const currentExperimentTime = ref(new Date())
const currentUserId = ref(1001)

// 当前眼动数据
const currentData = ref<EyeTrackingData>({
  experiment_id: 1,
  user_id: 1001,
  sight_x: 0,
  sight_y: 0,
  sight_z: 0,
  gaze_x: 500,
  gaze_y: 500,
  gaze_object_id: 1,
  pupil_diameter: 4.0,
  timestamp: new Date()
})

// 数据历史记录
const dataHistory = ref<EyeTrackingData[]>([])

// 模拟数据定时器
let dataInterval: number | null = null

// 计算归一化的注视点坐标用于可视化
const normalizedGazeX = computed(() => {
  // 假设坐标范围是0-1000，转换为百分比
  return Math.min(100, Math.max(0, (currentData.value.gaze_x / 10)))
})

const normalizedGazeY = computed(() => {
  // 假设坐标范围是0-1000，转换为百分比
  return Math.min(100, Math.max(0, (currentData.value.gaze_y / 10)))
})

// 格式化时间显示
const formatTime = (time: Date) => {
  return time.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 简短时间格式
const formatTimeShort = (time: Date) => {
  return time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生成随机眼动数据
const generateRandomData = (): EyeTrackingData => {
  // 基于当前数据生成一些变化
  const baseX = currentData.value.gaze_x
  const baseY = currentData.value.gaze_y

  // 随机漫步模型 - 每次移动不超过50单位
  const newX = Math.max(0, Math.min(1000, baseX + (Math.random() * 100 - 50)))
  const newY = Math.max(0, Math.min(1000, baseY + (Math.random() * 100 - 50)))

  // 随机选择注视对象 (1-4)
  let newObjectId = currentData.value.gaze_object_id
  if (Math.random() > 0.7) { // 30%概率切换注视对象
    newObjectId = Math.floor(Math.random() * 4) + 1
  }

  // 瞳孔直径在3-5mm之间波动
  const newPupil = Math.max(3, Math.min(5, currentData.value.pupil_diameter + (Math.random() * 0.4 - 0.2)))

  return {
    experiment_id: currentExperimentId.value,
    user_id: currentUserId.value,
    sight_x: Math.random() * 10 - 5,  // -5到5之间的随机值
    sight_y: Math.random() * 10 - 5,
    sight_z: Math.random() * 5,
    gaze_x: newX,
    gaze_y: newY,
    gaze_object_id: newObjectId,
    pupil_diameter: newPupil,
    timestamp: new Date()
  }
}

// 更新数据
const updateData = () => {
  const newData = generateRandomData()
  currentData.value = newData

  // 添加到历史记录
  dataHistory.value.unshift(newData)
  if (dataHistory.value.length > 10) {
    dataHistory.value.pop()
  }
}

// 组件挂载时开始模拟数据
onMounted(() => {
  // 初始化历史数据
  for (let i = 0; i < 5; i++) {
    dataHistory.value.push(generateRandomData())
  }

  // 开始定时更新
  dataInterval = setInterval(updateData, 800) // 每800毫秒更新一次
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (dataInterval) {
    clearInterval(dataInterval)
  }
})
</script>

<style lang="scss" scoped>
.real-time-monitor {
  width: 100%;
  height: 100%;
  background-color: rgba(16, 31, 63, 0.8);
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #fff;
  border: 1px solid rgba(64, 115, 255, 0.3);
  box-shadow: 0 0 15px rgba(64, 115, 255, 0.1);

  .section-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 500;
    color: #fff;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(64, 115, 255, 0.3);
  }
}

.monitor-header {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  padding: 15px;
  background-color: rgba(26, 46, 91, 0.6);
  border-radius: 6px;

  .experiment-info {
    display: flex;
    align-items: center;
    font-size: 14px;

    .label {
      color: #7a9eff;
      margin-right: 8px;
    }

    .value {
      color: #fff;
      font-weight: 500;
    }
  }
}

.monitor-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;

  .data-section {
    flex: 1;
    min-width: 200px;
    background-color: rgba(26, 46, 91, 0.6);
    border-radius: 6px;
    padding: 10px 15px;

    .data-title {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #7a9eff;
      border-bottom: 1px solid rgba(64, 115, 255, 0.2);
      padding-bottom: 8px;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }

    .data-item {
      display: flex;
      flex-direction: column;

      .data-label {
        font-size: 12px;
        color: #8a9cc5;
        margin-bottom: 5px;
      }

      .data-value {
        font-size: 18px;
        font-weight: 500;
        color: #fff;
        background-color: rgba(64, 115, 255, 0.1);
        padding: 8px 12px;
        border-radius: 4px;
        text-align: center;
      }
    }
  }

  .visualization-section {
    flex: 2;
    min-width: 300px;

    .gaze-visualization {
      height: 100%;
      background-color: rgba(26, 46, 91, 0.6);
      border-radius: 6px;
      padding: 15px;

      .visualization-title {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #7a9eff;
        border-bottom: 1px solid rgba(64, 115, 255, 0.2);
        padding-bottom: 8px;
      }

      .heatmap-container {
        height: 250px;
        position: relative;

        .heatmap-placeholder {
          width: 100%;
          height: 100%;
          background-color: rgba(16, 31, 63, 0.8);
          border-radius: 4px;
          position: relative;
          overflow: hidden;

          .gaze-point {
            position: absolute;
            width: 15px;
            height: 15px;
            background-color: rgba(255, 0, 0, 0.7);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
            transition: all 0.3s ease;
            z-index: 2;
          }

          .object-marker {
            position: absolute;
            width: 30px;
            height: 30px;
            background-color: rgba(64, 115, 255, 0.3);
            border: 2px solid rgba(64, 115, 255, 0.8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
            color: #fff;
            font-weight: bold;
            z-index: 1;
          }
        }
      }
    }
  }
}

.data-history {
  flex: 1;
  background-color: rgba(26, 46, 91, 0.6);
  border-radius: 6px;
  padding: 15px;

  .history-title {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #7a9eff;
    border-bottom: 1px solid rgba(64, 115, 255, 0.2);
    padding-bottom: 8px;
  }

  .history-table {
    width: 100%;
    font-size: 14px;

    .table-header, .table-row {
      display: flex;
      padding: 8px 0;
    }

    .table-header {
      border-bottom: 1px solid rgba(64, 115, 255, 0.2);

      .header-cell {
        flex: 1;
        color: #7a9eff;
        font-weight: 500;
        text-align: center;
      }
    }

    .table-body {
      max-height: 200px;
      overflow-y: auto;

      .table-row {
        border-bottom: 1px solid rgba(64, 115, 255, 0.1);

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: rgba(64, 115, 255, 0.1);
        }
      }
    }

    .table-cell {
      flex: 1;
      text-align: center;
      padding: 4px;
      color: #fff;
    }
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(16, 31, 63, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(64, 115, 255, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 115, 255, 0.7);
}
</style>
