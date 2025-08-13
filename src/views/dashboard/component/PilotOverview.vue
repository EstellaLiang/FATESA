<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'
import GazePath from "@/views/dashboard/component/GazePath.vue";

defineProps<{
  pilot: {
    name: string
    airline: string
    flightNumber: string
    totalHours: number
    status: string
  },
  fatigueScore: number,
}>()

const isVideoPaused = ref(false)
const activeCamera = ref('main') // main, face, hands
const videoRef = ref<HTMLVideoElement>()

const toggleCamera = (camera: string) => {
  activeCamera.value = camera
}

const formatTime = (date: Date) => {
  return date.toISOString().split('T')[1].split('.')[0]
}

const currentTime = ref(formatTime(new Date()))
const deviceId = 'CAM-' + Math.random().toString(36).substr(2, 8).toUpperCase()

// 视频控制函数
const toggleVideo = () => {
  if (videoRef.value) {
    if (isVideoPaused.value) {
      videoRef.value.play()
    } else {
      videoRef.value.pause()
    }
    isVideoPaused.value = !isVideoPaused.value
  }
}

const restartVideo = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
    isVideoPaused.value = false
  }
}

// 视频事件处理
const onVideoPlay = () => {
  isVideoPaused.value = false
}

const onVideoPause = () => {
  isVideoPaused.value = true
}

const onVideoEnded = () => {
  // 视频结束后自动重新开始
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
  }
}

let timeInterval: NodeJS.Timeout

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = formatTime(new Date())
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="overview-container">
    <!-- 飞行员档案 -->
    <div class="pilot-profile">
      <h2>飞行员档案</h2>
      <div class="profile-details">
        <div class="detail-item">
          <span class="label">姓名:</span>
          <span class="value">{{ pilot.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">所属航空:</span>
          <span class="value">{{ pilot.airline }}</span>
        </div>
        <div class="detail-item">
          <span class="label">当前航班:</span>
          <span class="value">{{ pilot.flightNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">飞行时长:</span>
          <span class="value">{{ pilot.totalHours.toLocaleString() }} 小时</span>
        </div>
        <div class="detail-item">
          <span class="label">当前状态:</span>
          <span class="value status" :class="pilot.status === '执勤' ? 'on-duty' : 'resting'">
            {{ pilot.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- 实时视频流 -->
    <div class="video-stream">
      <div class="video-header">
        <h2>实时监控</h2>
        <button
            class="pause-btn"
            @click="toggleVideo"
            :class="{ paused: isVideoPaused }"
        >
          {{ isVideoPaused ? '继续' : '暂停' }}
        </button>
      </div>

      <div class="video-main">
        <div class="main-view" :class="{ paused: isVideoPaused }">
          <video
            ref="videoRef"
            class="video-player"
            src="/src/assets/video/test2.mp4"
            @play="onVideoPlay"
            @pause="onVideoPause"
            @ended="onVideoEnded"
            loop
            muted
            autoplay
          ></video>
          <div v-if="isVideoPaused" class="pause-overlay">
            监控已暂停
          </div>
          <div class="video-timecode">
            {{ currentTime }} | {{ deviceId }}
          </div>
          <!-- <div class="video-controls">
            <button class="control-btn" @click="toggleVideo">
              {{ isVideoPaused ? '▶' : '⏸' }}
            </button>
            <button class="control-btn" @click="restartVideo">⏹</button>
          </div> -->
        </div>

        <div class="camera-switcher">
          <button
              class="camera-btn"
              :class="{ active: activeCamera === 'main' }"
              @click="toggleCamera('main')"
          >
            主视角
          </button>
          <button
              class="camera-btn"
              :class="{ active: activeCamera === 'face' }"
              @click="toggleCamera('face')"
          >
            面部特写
          </button>
          <button
              class="camera-btn"
              :class="{ active: activeCamera === 'hands' }"
              @click="toggleCamera('hands')"
          >
            手部动作
          </button>
        </div>
      </div>
    </div>

    <!-- 快速控制栏 -->
    <div class="quick-controls">
      <h2>快速控制</h2>
      <div class="control-buttons">
        <button class="control-btn screenshot">
          <i class="icon-camera"></i>
          <span>截图保存</span>
        </button>
        <button class="control-btn emergency">
          <i class="icon-alert"></i>
          <span>紧急联络</span>
        </button>
        <button class="control-btn settings">
          <i class="icon-settings"></i>
          <span>系统设置</span>
        </button>
      </div>
    </div>
    <div class="gaze-path">
      <h2>视线轨迹</h2>
      <GazePath :fatigueScore="fatigueScore"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overview-container {
  padding: 15px;
  color: #e0e0e0;

  h2 {
    font-size: 1.2rem;
    margin: 0 0 15px 0;
    color: #64b5f6;
    border-bottom: 1px solid #1e3a5a;
    padding-bottom: 8px;
  }
}

.pilot-profile {
  margin-bottom: 10px;

  .profile-details {
    background-color: #1a3a5a;
    border-radius: 6px;
    padding: 15px;
  }

  .detail-item {
    display: flex;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: bold;
      width: 80px;
      color: #90caf9;
    }

    .value {
      flex: 1;

      &.status {
        font-weight: bold;

        &.on-duty {
          color: #81c784;
        }

        &.resting {
          color: #4fc3f7;
        }
      }
    }
  }
}

.video-stream {
  margin-bottom: 20px;

  .video-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pause-btn {
    background-color: #1e3a5a;
    color: #e0e0e0;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;

    &:hover {
      background-color: #2e4a6a;
    }

    &.paused {
      background-color: #d32f2f;
      color: white;
    }
  }

  .video-main {
    background-color: #000;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    height: 20vh;

    .main-view {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;

      &.paused {
        opacity: 0.7;
      }
    }

    .video-player {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .video-controls {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 5px;
      z-index: 3;

      .control-btn {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }
      }
    }

    .pause-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
      z-index: 2;
    }

    .video-timecode {
      position: absolute;
      bottom: 5px;
      right: 5px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 5px;
      font-size: 0.8rem;
      border-radius: 3px;
    }
  }

  .camera-switcher {
    display: flex;
    margin-top: 10px;

    .camera-btn {
      flex: 1;
      background-color: #1e3a5a;
      color: #e0e0e0;
      border: none;
      padding: 8px 0;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;

      &:not(:last-child) {
        margin-right: 5px;
      }

      &:hover {
        background-color: #2e4a6a;
      }

      &.active {
        background-color: #0d47a1;
        color: white;
      }
    }
  }
}

.quick-controls {
  .control-buttons {
    display: flex;
    gap: 8px;

    .control-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #1e3a5a;
      border: none;
      border-radius: 6px;
      padding: 8px 5px;
      cursor: pointer;
      color: #e0e0e0;
      transition: all 0.3s;
      margin-bottom: 10px;

      i {
        font-size: 1.5rem;
        margin-bottom: 5px;
      }

      span {
        font-size: 0.9rem;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      &.screenshot {
        i {
          color: #4caf50;
        }
      }

      &.emergency {
        i {
          color: #f44336;
        }
      }

      &.settings {
        i {
          color: #ff9800;
        }
      }
    }
  }
}

.gaze-path {
  width: 400px;
}

@media (max-width: 1680px) {
  .profile-details {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
  }

  .overview-container {
    h2 {
      font-size: 1rem;
    }
  }
}
</style>
