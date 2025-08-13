<script setup lang="ts">
import {ref, onMounted, computed, watch, onUnmounted, onBeforeUnmount} from 'vue'
import {
  Video,
  Maximize2,
  Minimize2,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Activity,
  Gauge,
  Circle,
  Focus
} from 'lucide-vue-next'
import FatigueTrendChart from "@/views/online/component/FatigueTrendChart.vue";
import CameraVideo from "@/views/online/component/RealtimeVideo.vue";

// 状态管理
const isFullscreen = ref(false)
const showSettings = ref(false)
const alertStatus = ref('normal') // 'normal', 'warning', 'danger'
const videoLayout = ref('pip') // 'split', 'pip', 'driver', 'cockpit'
const refreshRate = ref(2) // 秒
const warningThreshold = ref(60)
const dangerThreshold = ref(80)
const showGazePoint = ref(true)
const showFatigueAnalysis = ref(true)
const isLoading = ref(true) // 新增加载状态
const error = ref<string | null>(null) // 新增错误状态

// 监测数据
const fatigueScore = ref(68)
const perclos = ref(28)
const blinkRate = ref(12)
const gazeStability = ref(82)
const frameRate = ref(29.8)
const latency = ref(120)
const timeOnDuty = ref('04:32:17')
const gazeX = ref(50) // 注视点X坐标 (0-100)
const gazeY = ref(50) // 注视点Y坐标 (0-100)
const gazeDuration = ref(2.4) // 注视持续时间(秒)
const currentFocusArea = ref('仪表盘') // 当前注视区域

// 历史数据
const fatigueHistory = ref<number[]>([])
const gazeHistory = ref<{ x: number, y: number }[]>([])
const maxHistoryPoints = 30

// 模拟实时数据更新
let intervalId: NodeJS.Timeout

const fetchData = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    // 这里可以替换为实际的 API 请求
    return {
      fatigueScore: Math.max(0, Math.min(100, fatigueScore.value + (Math.random() * 4 - 2))),
      perclos: Math.max(0, Math.min(100, perclos.value + (Math.random() * 3 - 1.5))),
      blinkRate: Math.max(0, blinkRate.value + (Math.random() * 2 - 1)),
      gazeStability: Math.max(0, Math.min(100, gazeStability.value + (Math.random() * 3 - 1.5))),
      frameRate: 28 + Math.random() * 3,
      latency: 100 + Math.random() * 50,
      gazeX: Math.max(0, Math.min(100, gazeX.value + (Math.random() * 20 - 10))),
      gazeY: Math.max(0, Math.min(100, gazeY.value + (Math.random() * 15 - 7.5))),
      gazeDuration: Math.max(0.5, Math.min(5, gazeDuration.value + (Math.random() * 0.5 - 0.25)))
    }
  } catch (err) {
    error.value = '数据获取失败，请稍后重试'
    console.error('数据获取错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 计算属性
const fatigueLevel = computed(() => {
  if (fatigueScore.value > dangerThreshold.value) return '严重疲劳'
  if (fatigueScore.value > warningThreshold.value) return '中度疲劳'
  return '正常'
})

const updateData = async () => {
  const data = await fetchData()
  if (data) {
    fatigueScore.value = data.fatigueScore
    perclos.value = data.perclos
    blinkRate.value = data.blinkRate
    gazeStability.value = data.gazeStability
    frameRate.value = data.frameRate
    latency.value = data.latency
    gazeX.value = data.gazeX
    gazeY.value = data.gazeY
    gazeDuration.value = data.gazeDuration

    // 更新注视区域
    if (gazeX.value < 30) currentFocusArea.value = '左后视镜'
    else if (gazeX.value > 70) currentFocusArea.value = '右后视镜'
    else if (gazeY.value < 40) currentFocusArea.value = '前方道路'
    else if (gazeY.value > 60) currentFocusArea.value = '仪表盘'
    else currentFocusArea.value = '方向盘区域'

    // 更新历史数据
    fatigueHistory.value.push(fatigueScore.value)
    if (fatigueHistory.value.length > maxHistoryPoints) {
      fatigueHistory.value.shift()
    }

    gazeHistory.value.push({x: gazeX.value, y: gazeY.value})
    if (gazeHistory.value.length > 10) {
      gazeHistory.value.shift()
    }

    // 更新预警状态
    if (fatigueScore.value > dangerThreshold.value) {
      alertStatus.value = 'danger'
    } else if (fatigueScore.value > warningThreshold.value) {
      alertStatus.value = 'warning'
    } else {
      alertStatus.value = 'normal'
    }
  }
}

onMounted(async () => {
  await updateData()
  intervalId = setInterval(updateData, refreshRate.value * 1000)
})

// 添加卸载处理
onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// 方法
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const updateRefreshRate = (rate: number) => {
  refreshRate.value = rate
  clearInterval(intervalId)
  intervalId = setInterval(updateData, refreshRate.value * 1000)
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 注视点位置计算
const gazePosition = computed(() => ({
  left: `${gazeX.value}%`,
  top: `${gazeY.value}%`,
  width: `${Math.min(10, 5 + gazeDuration.value)}px`,
  height: `${Math.min(10, 5 + gazeDuration.value)}px`,
  opacity: Math.min(1, 0.5 + gazeDuration.value / 5)
}))

// 注视轨迹点样式
const gazeHistoryStyles = computed(() =>
    gazeHistory.value.map((point, index) => ({
      left: `${point.x}%`,
      top: `${point.y}%`,
      opacity: 0.3 + (index / gazeHistory.value.length) * 0.7,
      zIndex: index
    }))
)

// 模拟数据
const timeLabels = ref([
  '08:00', '08:30', '09:00', '09:30', '10:00',
  '10:30', '11:00', '11:30', '12:00'
])

const fatigueData = ref([45, 52, 58, 65, 62, 68, 72, 75, 78])

// 模拟数据更新
setInterval(() => {
  const newValue = Math.max(30, Math.min(90,
      fatigueData.value[fatigueData.value.length - 1] + (Math.random() * 6 - 3)
  ))
  fatigueData.value.push(newValue)
  timeLabels.value.push(`${12 + Math.floor(fatigueData.value.length / 2)}:${fatigueData.value.length % 2 === 0 ? '00' : '30'}`)

  // 保持数据长度
  if (fatigueData.value.length > 20) {
    fatigueData.value.shift()
    timeLabels.value.shift()
  }
}, 3000)
</script>

<template>
  <div class="live-monitoring" :class="{ fullscreen: isFullscreen }">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div v-else-if="error" class="error-overlay">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <div class="monitoring-header">
        <h2>驾驶员眼动与疲劳实时监测 - CA1234航班</h2>
        <div class="header-controls">
          <div class="time-display">
            <Clock :size="16"/>
            <span>{{ timeOnDuty }}</span>
          </div>
          <select class="layout-select" v-model="videoLayout">
            <option value="split">分屏显示</option>
            <option value="pip">画中画</option>
            <option value="driver">驾驶员画面</option>
            <option value="cockpit">驾驶舱画面</option>
          </select>
          <button class="control-button" @click="toggleFullscreen">
            <component :is="isFullscreen ? Minimize2 : Maximize2" :size="18"/>
          </button>
          <button class="control-button" @click="showSettings = !showSettings">
            <Settings :size="18"/>
          </button>
        </div>
      </div>

      <div class="monitoring-content">
        <!-- 视频区域 -->
        <div class="video-container" :class="videoLayout">
          <!-- 驾驶员画面 -->
          <div class="video-area driver-view" :class="{ active: ['split', 'pip', 'driver'].includes(videoLayout) }">
            <div class="video-placeholder">
              <video
                src="@/assets/video/online.mp4"
                class="cam-box"
                autoplay
                muted
                loop
                playsinline
              ></video>
              <!--              <Video :size="48" class="video-icon"/>-->
              <!--              <p>驾驶员监控画面</p>-->

              <!-- 眼动跟踪可视化 -->
              <!--              <div class="gaze-tracking">-->
              <!--                <div-->
              <!--                    class="gaze-history-point"-->
              <!--                    v-for="(point, index) in gazeHistoryStyles"-->
              <!--                    :key="index"-->
              <!--                    :style="point"-->
              <!--                ></div>-->
              <!--                <div-->
              <!--                    class="gaze-point"-->
              <!--                    :style="gazePosition"-->
              <!--                    v-if="showGazePoint"-->
              <!--                ></div>-->
              <!--              </div>-->

              <!-- 疲劳分析标记 -->
              <div class="fatigue-markers" v-if="showFatigueAnalysis">
                <!--                <div class="eye-marker left" :class="{ blinking: blinkRate > 15 }"></div>-->
                <!--                <div class="eye-marker right" :class="{ blinking: blinkRate > 15 }"></div>-->
                <!--                <div class="face-marker"></div>-->
              </div>
            </div>

            <!-- 视频统计信息 -->
            <!-- <div class="video-stats">
              <div class="stat-item">
                <span class="stat-label">帧率:</span>
                <span class="stat-value">{{ frameRate.toFixed(1) }} fps</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">延迟:</span>
                <span class="stat-value">{{ Math.round(latency) }} ms</span>
              </div>
            </div> -->

            <!-- 预警指示 -->
            <!-- <div class="alert-indicator" :class="alertStatus" v-if="alertStatus !== 'normal'">
              <AlertTriangle :size="16" class="alert-icon"/>
              <span>{{ fatigueLevel }}预警</span>
              <span class="alert-score">{{ Math.round(fatigueScore) }}</span>
            </div> -->
          </div>

          <!-- 驾驶舱画面 -->
          <div class="video-area cockpit-view" :class="{ active: ['split', 'pip', 'cockpit'].includes(videoLayout) }">
            <video
              src="@/assets/video/scene.mp4"
              class="cam-box"
              autoplay
              muted
              loop
              playsinline
            ></video>
            <div class="gaze-overlay">
              <div class="gaze-tracking">
                <div
                    class="gaze-history-point"
                    v-for="(point, index) in gazeHistoryStyles"
                    :key="index"
                    :style="point"
                ></div>
                <div
                    class="gaze-point"
                    :style="gazePosition"
                    v-if="showGazePoint && ['split', 'cockpit'].includes(videoLayout)"
                ></div>
              </div>
              <div class="focus-area">
                <Focus :size="16"/>
                <span>{{ currentFocusArea }}</span>
              </div>
            </div>

            <div class="cockpit-stats">
              <div class="stat-item">
                <span class="stat-label">注视区域:</span>
                <span class="stat-value">{{ currentFocusArea }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">注视时长:</span>
                <span class="stat-value">{{ gazeDuration.toFixed(1) }}秒</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据面板 -->
        <div class="data-panel">
          <div class="data-card">
            <h3>疲劳度趋势 <span class="badge" :class="alertStatus">{{ fatigueLevel }}</span></h3>
            <div class="chart-container">
              <FatigueTrendChart
                  :data="fatigueData"
                  :time-labels="timeLabels"
                  :warning-threshold="60"
                  :danger-threshold="80"
              />
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card"
                 :class="{ warning: fatigueScore > warningThreshold, danger: fatigueScore > dangerThreshold }">
              <div class="metric-header">
                <Activity :size="18"/>
                <h4>疲劳度</h4>
              </div>
              <div class="metric-value">
                {{ Math.round(fatigueScore) }}
                <span class="metric-unit">/100</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${fatigueScore}%` }"></div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <Eye :size="18"/>
                <h4>PERCLOS</h4>
              </div>
              <div class="metric-value">
                {{ Math.round(perclos) }}
                <span class="metric-unit">%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${perclos}%` }"></div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <EyeOff :size="18"/>
                <h4>眨眼频率</h4>
              </div>
              <div class="metric-value">
                {{ Math.round(blinkRate) }}
                <span class="metric-unit">次/分钟</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${Math.min(100, blinkRate * 5)}%` }"></div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <Gauge :size="18"/>
                <h4>视线稳定性</h4>
              </div>
              <div class="metric-value">
                {{ Math.round(gazeStability) }}
                <span class="metric-unit">%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${gazeStability}%` }"></div>
              </div>
            </div>
          </div>

          <div class="gaze-data-card">
            <h3>眼动追踪数据</h3>
            <div class="gaze-metrics">
              <div class="gaze-metric">
                <div class="gaze-label">当前注视点:</div>
                <div class="gaze-value">X: {{ Math.round(gazeX) }}%, Y: {{ Math.round(gazeY) }}%</div>
              </div>
              <div class="gaze-metric">
                <div class="gaze-label">注视持续时间:</div>
                <div class="gaze-value">{{ gazeDuration.toFixed(1) }}秒</div>
              </div>
              <div class="gaze-metric">
                <div class="gaze-label">当前注视区域:</div>
                <div class="gaze-value">{{ currentFocusArea }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设置面板 -->
        <div v-if="showSettings" class="settings-panel">
          <div class="settings-header">
            <h3>监测设置</h3>
            <button class="close-button" @click="showSettings = false">&times;</button>
          </div>
          <div class="settings-content">
            <div class="setting-group">
              <label>视频布局</label>
              <select class="setting-control" v-model="videoLayout">
                <option value="split">分屏显示</option>
                <option value="pip">画中画</option>
                <option value="driver">驾驶员画面</option>
                <option value="cockpit">驾驶舱画面</option>
              </select>
            </div>

            <div class="setting-group">
              <label>初级预警阈值: {{ warningThreshold }}%</label>
              <input
                  type="range"
                  class="setting-slider"
                  v-model="warningThreshold"
                  :max="dangerThreshold - 5"
              />
            </div>

            <div class="setting-group">
              <label>严重预警阈值: {{ dangerThreshold }}%</label>
              <input
                  type="range"
                  class="setting-slider"
                  v-model="dangerThreshold"
                  :min="warningThreshold + 5"
              />
            </div>

            <div class="setting-group">
              <label>数据刷新频率</label>
              <select class="setting-control" v-model="refreshRate" @change="updateRefreshRate(refreshRate)">
                <option :value="1">实时 (1秒)</option>
                <option :value="2">快速 (2秒)</option>
                <option :value="5">普通 (5秒)</option>
                <option :value="10">慢速 (10秒)</option>
              </select>
            </div>

            <div class="setting-group">
              <label>显示选项</label>
              <div class="setting-checkbox">
                <input type="checkbox" id="showGazePoint" v-model="showGazePoint"/>
                <label for="showGazePoint">显示注视点</label>
              </div>
              <div class="setting-checkbox">
                <input type="checkbox" id="showFatigueAnalysis" v-model="showFatigueAnalysis"/>
                <label for="showFatigueAnalysis">显示疲劳分析标记</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部状态栏 -->
      <div class="status-bar">
        <div class="status-item">
          <span class="status-label">系统状态:</span>
          <span class="status-value">运行中</span>
        </div>
        <div class="status-item">
          <span class="status-label">最后更新:</span>
          <span class="status-value">{{ new Date().toLocaleTimeString() }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">注视区域:</span>
          <span class="status-value">{{ currentFocusArea }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">疲劳状态:</span>
          <span class="status-value" :class="alertStatus">{{ fatigueLevel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.live-monitoring {
  height: 100vh; // 使用完整的视口高度
  max-height: 100vh; // 确保不超过视口高度
  display: flex;
  flex-direction: column;
  background-color: #0a1a2e;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden; // 防止内容溢出
  position: relative; // 为绝对定位的子元素提供参考

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
  }
}

.loading-overlay {
  position: absolute; // 改为绝对定位，避免影响布局
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-overlay {
  position: absolute; // 改为绝对定位
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  color: white;
  font-size: 1.2rem;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px; // 减少padding以节省空间
  background-color: #12263a;
  border-bottom: 1px solid #1e3a5a;
  flex-shrink: 0; // 防止头部收缩
  min-height: 60px; // 设置最小高度

  h2 {
    margin: 0;
    font-size: 1.2rem; // 稍微减小字体
    color: #e0e0e0;
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 15px;
  font-size: 0.9rem;
  color: #90caf9;
}

.layout-select {
  background-color: #1e3a5a;
  border: 1px solid #2e4a6a;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-right: 10px;

  &:focus {
    outline: none;
    border-color: #4fc3f7;
  }
}

.header-controls {
  display: flex;
  align-items: center;

  .control-button {
    background-color: #1e3a5a;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #90caf9;
    transition: all 0.3s;
    margin-left: 8px;

    &:hover {
      background-color: #2e4a6a;
      color: white;
    }
  }
}

.monitoring-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0; // 确保flex子元素可以收缩
  height: calc(100vh - 120px); // 减去头部和状态栏的高度，保证子元素有确定高度
}

.video-container {
  flex: 1;
  display: grid;
  position: relative;
  min-width: 0; // 确保grid可以收缩
  min-height: 0; // 确保grid可以收缩
  height: 100%; // 确保占满可用高度

  &.split {
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }

  &.pip {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;

    .cockpit-view {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 30%;
      height: 30%;
      border: 2px solid #4fc3f7;
      border-radius: 8px;
      overflow: hidden;
      z-index: 2;
      
      @media (max-width: 768px) {
        width: 40%;
        height: 40%;
        bottom: 10px;
        right: 10px;
      }
    }
  }

}

.video-area {
  position: relative;
  background-color: #050e17;
  transition: all 0.3s ease;
  height: 100%; // 确保占满容器高度
  overflow: hidden; // 防止内容溢出

  &:not(.active) {
    display: none;
  }

  &.driver-view {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.cockpit-view {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000;
  color: #7f8c8d;
  position: relative;

  .video-icon {
    margin-bottom: 15px;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.gaze-tracking {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden; /* 防止内容溢出 */
  max-width: 100%;
  max-height: 100%;
}

.gaze-point {
  position: absolute;
  background-color: #ff0000;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
}

.gaze-history-point {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
}

.fatigue-markers {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 80px;

  .eye-marker {
    position: absolute;
    width: 20px;
    height: 12px;
    background-color: rgba(76, 175, 80, 0.3);
    border-radius: 50%;
    border: 2px solid rgba(76, 175, 80, 0.8);

    &.left {
      left: 30%;
      top: 30%;
    }

    &.right {
      right: 30%;
      top: 30%;
    }

    &.blinking {
      animation: blink 2s infinite;
      border-color: rgba(255, 152, 0, 0.8);
      background-color: rgba(255, 152, 0, 0.3);
    }
  }

  .face-marker {
    position: absolute;
    width: 80px;
    height: 100px;
    border: 2px dashed rgba(76, 175, 80, 0.5);
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.gaze-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden; /* 防止内容溢出 */
  /* 兼容性处理，防止子元素超出父容器 */
  max-width: 100%;
  max-height: 100%;

  .focus-area {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    backdrop-filter: blur(5px);
  }
}

.video-stats, .cockpit-stats {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  backdrop-filter: blur(5px);

  .stat-item {
    display: flex;
    justify-content: space-between;
    min-width: 120px;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  .stat-label {
    color: #b0bec5;
    margin-right: 10px;
  }

  .stat-value {
    color: white;
    font-weight: 500;
  }
}

.alert-indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .alert-icon {
    flex-shrink: 0;
  }

  .alert-score {
    margin-left: 5px;
    font-weight: 700;
  }

  &.warning {
    background-color: rgba(255, 152, 0, 0.2);
    color: #945a04;
    border: 1px solid rgba(255, 152, 0, 0.5);
  }

  &.danger {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
    border: 1px solid rgba(244, 67, 54, 0.5);
    animation: pulse 1.5s infinite;
  }
}

.data-panel {
  width: 500px; // 减少默认宽度
  min-width: 350px; // 设置最小宽度
  max-width: 600px; // 设置最大宽度
  padding: 15px; // 减少padding
  background-color: #0f2135;
  border-left: 1px solid #1e3a5a;
  overflow-y: auto; // 允许垂直滚动
  overflow-x: hidden; // 防止水平滚动
  transition: width 0.3s ease;
  flex-shrink: 0; // 防止收缩
  height: 100%; // 确保占满可用高度
  
  @media (max-width: 1400px) {
    width: 450px;
    min-width: 300px;
  }
  
  @media (max-width: 1200px) {
    width: 400px;
    min-width: 280px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: 1px solid #1e3a5a;
    order: 2; // 在移动端将数据面板放在底部
    height: auto; // 移动端自适应高度
    max-height: 40vh; // 限制最大高度
  }
}

.data-card {
  background-color: #12263a;
  border-radius: 8px;
  padding: 12px; // 减少padding
  margin-bottom: 15px; // 减少margin
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-top: 0;
    margin-bottom: 12px; // 减少margin
    font-size: 0.95rem; // 稍微减小字体
    color: #90caf9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .badge {
      font-size: 0.75rem; // 减小badge字体
      padding: 2px 6px; // 减少padding
      border-radius: 10px;
      font-weight: 500;

      &.normal {
        background-color: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }

      &.warning {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;
      }

      &.danger {
        background-color: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }
    }
  }
}

.chart-container {
  height: 200px; // 减少图表高度
  width: 100%;
  
  @media (max-width: 768px) {
    height: 150px; // 移动端进一步减少高度
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px; // 减少gap
  margin-bottom: 15px; // 减少margin
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.metric-card {
  background-color: #12263a;
  border-radius: 8px;
  padding: 12px; // 减少padding
  transition: all 0.3s ease;

  &.warning {
    border-left: 4px solid #ff9800;
  }

  &.danger {
    border-left: 4px solid #f44336;
    animation: pulse-bg 2s infinite;
  }
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px; // 减少margin

  h4 {
    margin: 0;
    font-size: 0.85rem; // 减小字体
    font-weight: 500;
    color: #b0bec5;
  }

  svg {
    color: #64b5f6;
  }
}

.metric-value {
  font-size: 1.6rem; // 减小字体
  font-weight: 600;
  margin-bottom: 8px; // 减少margin
  color: white;

  .metric-unit {
    font-size: 0.9rem; // 减小单位字体
    color: #90a4ae;
    margin-left: 2px;
  }
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(144, 164, 174, 0.2);
  border-radius: 2px;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    background-color: #4fc3f7;
    transition: width 0.5s ease;
  }
}

.gaze-data-card {
  background-color: #12263a;
  border-radius: 8px;
  padding: 12px; // 减少padding
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-top: 0;
    margin-bottom: 12px; // 减少margin
    font-size: 0.95rem; // 减小字体
    color: #90caf9;
  }
}

.gaze-metrics {
  display: grid;
  gap: 10px; // 减少gap
}

.gaze-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .gaze-label {
    color: #b0bec5;
    font-size: 0.85rem; // 减小字体
  }

  .gaze-value {
    color: white;
    font-weight: 500;
    font-size: 0.9rem; // 减小字体
  }
}

.settings-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px; // 减少宽度
  max-width: 90vw; // 限制最大宽度
  height: 100%;
  background-color: #12263a;
  border-left: 1px solid #1e3a5a;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: 1px solid #1e3a5a;
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px; // 减少padding
  border-bottom: 1px solid #1e3a5a;
  flex-shrink: 0; // 防止收缩

  h3 {
    margin: 0;
    font-size: 1rem; // 减小字体
    color: #e0e0e0;
  }

  .close-button {
    background: none;
    border: none;
    color: #90a4ae;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 5px;

    &:hover {
      color: white;
    }
  }
}

.settings-content {
  padding: 15px; // 减少padding
  overflow-y: auto; // 允许滚动
  height: calc(100% - 60px); // 减去头部高度
}

.setting-group {
  margin-bottom: 15px; // 减少margin

  label {
    display: block;
    margin-bottom: 6px; // 减少margin
    font-size: 0.85rem; // 减小字体
    color: #b0bec5;
  }
}

.setting-control {
  width: 100%;
  padding: 6px 10px; // 减少padding
  background-color: #1e3a5a;
  border: 1px solid #2e4a6a;
  border-radius: 4px;
  color: white;
  font-size: 0.85rem; // 减小字体

  &:focus {
    outline: none;
    border-color: #4fc3f7;
  }
}

.setting-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none; /* 新增标准属性 */
  background: #1e3a5a;
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #4fc3f7;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #4fc3f7;
    border-radius: 50%;
    cursor: pointer;
  }
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px; // 减少margin

  input {
    width: 16px;
    height: 16px;
  }

  label {
    margin: 0;
    color: white;
    font-size: 0.85rem; // 减小字体
  }
}

.status-bar {
  display: flex;
  padding: 8px 20px; // 减少padding
  background-color: #12263a;
  border-top: 1px solid #1e3a5a;
  font-size: 0.8rem; // 减小字体
  flex-shrink: 0; // 防止收缩
  min-height: 40px; // 设置最小高度
}

.status-item {
  display: flex;
  align-items: center;
  margin-right: 15px; // 减少margin

  .status-label {
    color: #b0bec5;
    margin-right: 6px; // 减少margin
  }

  .status-value {
    color: white;
  }
}

@keyframes blink {
  0%, 100% {
    height: 12px;
  }
  50% {
    height: 2px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
}

@keyframes pulse-bg {
  0%, 100% {
    background-color: #12263a;
  }
  50% {
    background-color: #183049;
  }
}

.cam-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  z-index: 0;
}

// 添加响应式布局的媒体查询
@media (max-width: 1200px) {
  .monitoring-content {
    flex-direction: column;
    height: calc(100vh - 120px); // 保持高度计算，避免子元素高度为0
  }
  
  .video-container {
    height: 60vh;
    min-height: 300px; // 减少最小高度
    max-height: 60vh; // 限制最大高度
  }
  
  .data-panel {
    height: 40vh;
    min-height: 200px; // 减少最小高度
    max-height: 40vh; // 限制最大高度
  }
}

@media (max-width: 768px) {
  .live-monitoring {
    height: 100vh;
  }
  
  .monitoring-content {
    height: calc(100vh - 100px); // 移动端调整高度
  }
  
  .monitoring-header {
    flex-direction: column;
    gap: 8px; // 减少gap
    align-items: flex-start;
    padding: 10px 15px; // 减少padding
    
    h2 {
      font-size: 1rem;
    }
    
    .header-controls {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .time-display {
    margin-right: 0;
  }
  
  .layout-select {
    margin-right: 5px;
    font-size: 0.8rem;
  }
  
  .control-button {
    width: 32px;
    height: 32px;
    margin-left: 5px;
  }
  
  .video-container {
    height: 50vh; // 移动端减少视频区域高度
    min-height: 250px;
  }
  
  .data-panel {
    height: 50vh; // 移动端增加数据面板高度
    min-height: 200px;
  }
  
  .status-bar {
    flex-wrap: wrap;
    gap: 8px; // 减少gap
    padding: 6px 15px; // 减少padding
    
    .status-item {
      margin-right: 8px; // 减少margin
      font-size: 0.75rem; // 减小字体
    }
  }
}

@media (max-width: 480px) {
  .monitoring-header {
    padding: 8px 12px; // 进一步减少padding
    
    h2 {
      font-size: 0.9rem;
    }
  }
  
  .data-panel {
    padding: 12px; // 减少padding
  }
  
  .metric-card {
    padding: 10px; // 减少padding
    
    .metric-value {
      font-size: 1.4rem; // 减小字体
    }
  }
  
  .chart-container {
    height: 150px; // 进一步减少图表高度
  }
  
  .settings-panel {
    width: 100%;
    max-width: 100%;
  }
}

// 添加滚动条样式优化
.data-panel::-webkit-scrollbar,
.settings-content::-webkit-scrollbar {
  width: 6px;
}

.data-panel::-webkit-scrollbar-track,
.settings-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.data-panel::-webkit-scrollbar-thumb,
.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}

// 确保所有内容都在可视区域内
* {
  box-sizing: border-box;
}

// 优化flex布局
.monitoring-content {
  > * {
    flex-shrink: 0;
  }
  
  .video-container {
    flex-shrink: 1;
  }
}
</style>
