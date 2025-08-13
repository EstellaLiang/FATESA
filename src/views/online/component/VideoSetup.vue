<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {Video, Settings, CheckCircle, XCircle} from 'lucide-vue-next'

const router = useRouter()
const props = defineProps<{ useSteps?: boolean }>()
const emit = defineEmits<{ (e: 'next'): void; (e: 'prev'): void }>()

const connectionMode = ref('auto') // 'auto' or 'manual'
const videoSource = ref('CAM_MAIN')
const protocol = ref('RTSP')
const ipAddress = ref('192.168.1.100')
const port = ref('554')
const resolution = ref('1080p')
const bitrate = ref(6) // Mbps
const layoutMode = ref('single') // 'single' or 'multi'

const videoSources = [
  {id: 'CAM_MAIN', name: '主驾驶舱摄像头'},
  {id: 'CAM_FACE', name: '面部特写摄像头'},
  {id: 'CAM_HANDS', name: '手部操作摄像头'}
]

const protocols = [
  {id: 'RTSP', name: 'RTSP (推荐)'},
  {id: 'WebRTC', name: 'WebRTC'},
  {id: 'ONVIF', name: 'ONVIF'}
]

const resolutions = ['720p', '1080p']
const bitrates = [2, 4, 6, 8]

const connectionStatus = ref('connecting') // 'connecting', 'success', 'failed'
const connectionStats = ref({
  fps: 0,
  latency: 0,
  signalStrength: 0
})

// 模拟连接过程
const connectVideo = () => {
  connectionStatus.value = 'connecting'

  // 模拟连接过程
  setTimeout(() => {
    const success = Math.random() > 0.2
    connectionStatus.value = success ? 'success' : 'failed'

    if (success) {
      connectionStats.value = {
        fps: 29.8,
        latency: 120,
        signalStrength: 95
      }
    }
  }, 2000)
}

const startLiveMonitoring = () => {
  if (props.useSteps) {
    emit('next')
  } else {
    router.push('/live-monitoring')
  }
}

// 自动连接
onMounted(() => {
  connectVideo()
})
</script>

<template>
  <div class="video-setup">
    <div class="setup-header">
      <h1>视频源配置</h1>
      <div class="mode-toggle">
        <button
            class="toggle-button"
            :class="{ active: connectionMode === 'auto' }"
            @click="connectionMode = 'auto'"
        >
          自动连接
        </button>
        <button
            class="toggle-button"
            :class="{ active: connectionMode === 'manual' }"
            @click="connectionMode = 'manual'"
        >
          手动配置
        </button>
      </div>
    </div>

    <div class="setup-content">
      <!-- 自动连接模式 -->
      <div v-if="connectionMode === 'auto'" class="auto-mode">
        <div class="video-preview">
          <div class="preview-placeholder">
            <Video :size="48" class="video-icon"/>
            <p>正在连接主视频源...</p>
          </div>

          <div class="connection-status" :class="connectionStatus">
            <div v-if="connectionStatus === 'connecting'" class="connecting">
              <div class="tech-spinner"></div>
              <span>正在建立连接...</span>
            </div>

            <div v-if="connectionStatus === 'success'" class="success">
              <CheckCircle :size="24" class="status-icon"/>
              <span>连接成功</span>
            </div>

            <div v-if="connectionStatus === 'failed'" class="failed">
              <XCircle :size="24" class="status-icon"/>
              <span>连接失败</span>
              <button class="retry-button" @click="connectVideo">
                重试
              </button>
            </div>
          </div>

          <div v-if="connectionStatus === 'success'" class="connection-stats">
            <div class="stat-item">
              <span class="stat-label">帧率:</span>
              <span class="stat-value">{{ connectionStats.fps }} <span class="stat-unit">fps</span></span>
            </div>
            <div class="stat-item">
              <span class="stat-label">延迟:</span>
              <span class="stat-value">{{ connectionStats.latency }} <span class="stat-unit">ms</span></span>
            </div>
            <div class="stat-item">
              <span class="stat-label">信号强度:</span>
              <span class="stat-value">{{ connectionStats.signalStrength }}<span class="stat-unit">%</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 手动配置模式 -->
      <div v-else class="manual-mode">
        <div class="config-section">
          <h3>
            <Settings :size="18" class="section-icon"/>
            基本设置
          </h3>
          <div class="form-group">
            <label>视频源</label>
            <select v-model="videoSource" class="form-control tech-select">
              <option
                  v-for="source in videoSources"
                  :key="source.id"
                  :value="source.id"
              >
                {{ source.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>传输协议</label>
            <select v-model="protocol" class="form-control tech-select">
              <option
                  v-for="proto in protocols"
                  :key="proto.id"
                  :value="proto.id"
              >
                {{ proto.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>IP地址</label>
            <input v-model="ipAddress" type="text" class="form-control tech-input"/>
          </div>

          <div class="form-group">
            <label>端口号</label>
            <input v-model="port" type="text" class="form-control tech-input"/>
          </div>
        </div>

        <div class="config-section">
          <h3>
            <Settings :size="18" class="section-icon"/>
            画质设置
          </h3>
          <div class="form-group">
            <label>分辨率</label>
            <div class="radio-group">
              <label
                  v-for="res in resolutions"
                  :key="res"
                  class="tech-radio-label"
              >
                <input
                    v-model="resolution"
                    type="radio"
                    :value="res"
                    class="tech-radio"
                />
                <span class="radio-custom"></span>
                {{ res }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>码率 ({{ bitrate }} Mbps)</label>
            <input
                v-model="bitrate"
                type="range"
                min="2"
                max="8"
                step="2"
                class="tech-slider"
            />
            <div class="slider-ticks">
              <span v-for="rate in bitrates" :key="rate">{{ rate }}</span>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h3>
            <Settings :size="18" class="section-icon"/>
            布局模式
          </h3>
          <div class="layout-options">
            <div
                class="layout-option"
                :class="{ active: layoutMode === 'single' }"
                @click="layoutMode = 'single'"
            >
              <div class="layout-preview single"></div>
              <span>单画面</span>
            </div>

            <div
                class="layout-option"
                :class="{ active: layoutMode === 'multi' }"
                @click="layoutMode = 'multi'"
            >
              <div class="layout-preview multi"></div>
              <span>多画面</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="setup-footer">
      <button class="back-button tech-button" @click="props.useSteps ? emit('prev') : router.go(-1)">
        返回
      </button>
      <button
          class="start-button tech-button primary"
          :disabled="connectionStatus !== 'success'"
          @click="startLiveMonitoring"
      >
        开始实时监测
        <span class="button-pulse"></span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
$title-height-small: 80px;
$primary-color: #00f0ff;
$secondary-color: #0055ff;
$dark-bg: #0a192f;
$card-bg: #172a45;
$text-color: #e6f1ff;
$accent-color: #64ffda;
$error-color: #ff5e5e;
$success-color: #64ffda;

.video-setup {
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: $dark-bg;
  color: $text-color;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}

.setup-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.8rem;
    color: $primary-color;
    margin-bottom: 0;
    font-weight: 500;
    text-shadow: 0 0 10px rgba($primary-color, 0.3);
  }
}

.mode-toggle {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba($primary-color, 0.3);
  background-color: rgba($primary-color, 0.05);
  backdrop-filter: blur(5px);

  .toggle-button {
    padding: 8px 20px;
    border: none;
    background-color: transparent;
    color: rgba($text-color, 0.7);
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    position: relative;

    &.active {
      background-color: rgba($primary-color, 0.2);
      color: $primary-color;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 2px;
        background: linear-gradient(90deg, $primary-color, $secondary-color);
      }
    }

    &:first-child {
      border-right: 1px solid rgba($primary-color, 0.1);
    }
  }
}

.setup-content {
  flex: 1;
  background-color: $card-bg;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($primary-color, 0.1);
}

.auto-mode {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba($primary-color, 0.03);
  border-radius: 8px;
  padding: 30px;
  position: relative;
  border: 1px dashed rgba($primary-color, 0.2);

  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba($text-color, 0.5);

    .video-icon {
      margin-bottom: 15px;
      color: rgba($primary-color, 0.5);
    }

    p {
      margin: 0;
    }
  }
}

.connection-status {
  margin-top: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  backdrop-filter: blur(5px);

  &.connecting {
    background-color: rgba(255, 165, 0, 0.1);
    color: #ffa500;
    border: 1px solid rgba(255, 165, 0, 0.3);
  }

  &.success {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
    border: 1px solid rgba($success-color, 0.3);
  }

  &.failed {
    background-color: rgba($error-color, 0.1);
    color: $error-color;
    border: 1px solid rgba($error-color, 0.3);
  }

  .status-icon {
    margin-right: 8px;
  }

  .retry-button {
    margin-left: 15px;
    padding: 5px 12px;
    background-color: rgba($error-color, 0.2);
    color: $error-color;
    border: 1px solid rgba($error-color, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;

    &:hover {
      background-color: rgba($error-color, 0.3);
    }
  }
}

.tech-spinner {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    opacity: 0.5;
    animation: spin 2s linear infinite reverse;
  }
}

.connection-stats {
  display: flex;
  margin-top: 20px;
  gap: 15px;

  .stat-item {
    background-color: rgba($primary-color, 0.05);
    padding: 12px 15px;
    border-radius: 6px;
    text-align: center;
    border: 1px solid rgba($primary-color, 0.1);
    min-width: 100px;

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: rgba($text-color, 0.7);
      margin-bottom: 5px;
    }

    .stat-value {
      font-weight: 600;
      color: $primary-color;
      font-size: 1.2rem;

      .stat-unit {
        font-size: 0.8rem;
        color: rgba($text-color, 0.6);
        margin-left: 2px;
      }
    }
  }
}

.manual-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.config-section {
  margin-bottom: 25px;

  h3 {
    color: $primary-color;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba($primary-color, 0.1);
    display: flex;
    align-items: center;
    font-weight: 500;

    .section-icon {
      margin-right: 10px;
      color: rgba($primary-color, 0.7);
    }
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    color: rgba($text-color, 0.9);
    font-size: 0.9rem;
  }
}

.tech-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba($primary-color, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: rgba($primary-color, 0.05);
  color: $text-color;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300f0ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
  }

  option {
    background-color: $card-bg;
    color: $text-color;
  }
}

.tech-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba($primary-color, 0.3);
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: rgba($primary-color, 0.05);
  color: $text-color;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
  }
}

.radio-group {
  display: flex;
  gap: 15px;
}

.tech-radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: rgba($text-color, 0.8);

  .tech-radio {
    display: none;

    &:checked + .radio-custom {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.1);

      &::after {
        content: '';
        display: block;
        width: 10px;
        height: 10px;
        background: $primary-color;
        border-radius: 50%;
      }
    }
  }

  .radio-custom {
    width: 18px;
    height: 18px;
    border: 2px solid rgba($primary-color, 0.5);
    border-radius: 50%;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
}

.tech-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba($primary-color, 0.1);
  border-radius: 3px;
  outline: none;
  margin: 15px 0 5px;
  background-image: linear-gradient(90deg, $primary-color, $primary-color);
  background-size: 0% 100%;
  background-repeat: no-repeat;
  border: 1px solid rgba($primary-color, 0.3);

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: $primary-color;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 2px $dark-bg, 0 0 0 4px rgba($primary-color, 0.5);
    transition: all 0.3s;
  }

  &:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 2px $dark-bg, 0 0 0 4px $primary-color;
  }
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba($text-color, 0.6);
  padding: 0 5px;
}

.layout-options {
  display: flex;
  gap: 15px;
}

.layout-option {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;

  &.active {
    .layout-preview {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.3),
      0 0 15px rgba($primary-color, 0.2);
    }

    span {
      color: $primary-color;
      font-weight: 500;
    }
  }

  span {
    display: block;
    margin-top: 8px;
    color: rgba($text-color, 0.7);
    font-size: 0.9rem;
  }
}

.layout-preview {
  width: 120px;
  height: 80px;
  background-color: rgba($primary-color, 0.05);
  border: 2px solid rgba($primary-color, 0.2);
  border-radius: 6px;
  transition: all 0.3s;

  &.single {
    // 单画面样式
  }

  &.multi {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    padding: 2px;
    background-color: rgba($primary-color, 0.1);

    &::before {
      content: '';
      grid-column: 1 / 3;
      background-color: rgba($primary-color, 0.2);
    }

    &::after {
      content: '';
      background-color: rgba($primary-color, 0.2);
    }
  }
}

.setup-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.tech-button {
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  position: relative;
  overflow: hidden;

  &.back-button {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
    border: 1px solid rgba($primary-color, 0.3);

    &:hover {
      background-color: rgba($primary-color, 0.2);
    }
  }

  &.primary {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: $dark-bg;
    box-shadow: 0 0 15px rgba(0, 95, 255, 0.3);
    font-weight: 600;

    &:hover:not(:disabled) {
      box-shadow: 0 0 20px rgba(0, 95, 255, 0.5);
      transform: translateY(-1px);
    }

    &:disabled {
      background: rgba($text-color, 0.1);
      color: rgba($text-color, 0.3);
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  .button-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.2);
    opacity: 0;
    border-radius: 6px;
    animation: pulse 2s infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style>
