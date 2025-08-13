<template>
  <div class="tech-detection-container">
    <h2>离线检测</h2>
    <!--    <div class="header">-->
    <!--      <div class="system-info">-->
    <!--        <span class="serial-number">73-3862</span>-->
    <!--        <span class="timestamp">2022-06-28 09:18:26</span>-->
    <!--        <span class="speed">U：4.8KM/M</span>-->
    <!--      </div>-->
    <!--      <div class="tech-decoration"></div>-->
    <!--    </div>-->
    <div class="content">
      <div class="left-panel">
        <div class="section-title">
          <!--          <span>当前文件：sdasfhioa.jpg</span>-->
          <!--          <div class="title-decoration"></div>-->
        </div>
        <div class="video-box">
          <video controls autoplay width="100%">
            <source :src="videoSrc" type="video/mp4">
            您的浏览器不支持 HTML5 视频。
          </video>
          <!--          <img src="@/assets/img/test-video.png" alt="">-->
        </div>
        <!--        <div class="action-buttons">-->
        <!--          <button @click="openImage" class="tech-button">-->
        <!--            <span class="button-icon">📷</span>-->
        <!--            <span class="button-text">打开图片</span>-->
        <!--          </button>-->
        <!--          <button @click="openFolder" class="tech-button">-->
        <!--            <span class="button-icon">📁</span>-->
        <!--            <span class="button-text">打开文件夹</span>-->
        <!--          </button>-->
        <!--          <button @click="openVideo" class="tech-button">-->
        <!--            <span class="button-icon">🎬</span>-->
        <!--            <span class="button-text">打开视频</span>-->
        <!--          </button>-->
        <!--          <button @click="openCamera" class="tech-button">-->
        <!--            <span class="button-icon">🎥</span>-->
        <!--            <span class="button-text">打开摄像头</span>-->
        <!--          </button>-->
        <!--          <button @click="saveResults" class="tech-button primary">-->
        <!--            <span class="button-icon">💾</span>-->
        <!--            <span class="button-text">保存</span>-->
        <!--          </button>-->
        <!--          <button @click="exit" class="tech-button danger">-->
        <!--            <span class="button-icon">🚪</span>-->
        <!--            <span class="button-text">退出</span>-->
        <!--          </button>-->
        <!--        </div>-->
      </div>

      <div class="right-panel">
        <!--        <div class="section-title">-->
        <!--          <span>检测结果与位置信息</span>-->
        <!--          <div class="title-decoration"></div>-->
        <!--        </div>-->
        <!--        <div class="detection-table">-->
        <!--          <table>-->
        <!--            <thead>-->
        <!--            <tr>-->
        <!--              <th>序号</th>-->
        <!--              <th>文件路径</th>-->
        <!--              <th>类别</th>-->
        <!--              <th>置信度</th>-->
        <!--              <th>坐标位置</th>-->
        <!--            </tr>-->
        <!--            </thead>-->
        <!--            <tbody>-->
        <!--            <tr-->
        <!--                v-for="(item, index) in filteredResults"-->
        <!--                :key="index"-->
        <!--                :class="{ 'active': activeIndex === index }"-->
        <!--                @click="selectDetection(index)"-->
        <!--            >-->
        <!--              <td class="index-cell">{{ index + 1 }}</td>-->
        <!--              <td class="file-path">{{ truncatePath(item.path) }}</td>-->
        <!--              <td :class="getClassColor(item.class)">{{ item.class }}</td>-->
        <!--              <td class="confidence-cell">{{ item.confidence }}%</td>-->
        <!--              <td class="coordinates-cell">{{ formatCoordinates(item.coordinates) }}</td>-->
        <!--            </tr>-->
        <!--            </tbody>-->
        <!--          </table>-->
        <!--        </div>-->
        <!--        <div class="section-title">-->
        <!--          <span>检测参数设置</span>-->
        <!--          <div class="title-decoration"></div>-->
        <!--        </div>-->
        <!--        <div class="detection-settings">-->
        <!--          <div class="settings-row">-->
        <!--            <div class="param-item">-->
        <!--              <span class="param-name">查看数据：</span>-->
        <!--              <span class="param-value">0.25</span>-->
        <!--            </div>-->
        <!--            <div class="param-item">-->
        <!--              <span class="param-name">支持此模块：</span>-->
        <!--              <span class="param-value">0.45</span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--          <div class="checkbox-row">-->
        <!--            <label class="tech-checkbox">-->
        <!--              <input type="checkbox" v-model="showLabels"/>-->
        <!--              <span class="checkmark"></span>-->
        <!--              <span class="checkbox-label">已显示标签名称与置信度</span>-->
        <!--            </label>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div class="section-title">-->
        <!--          <span>检测结果</span>-->
        <!--          <div class="title-decoration"></div>-->
        <!--        </div>-->
        <!--        <div class="detection-summary">-->
        <!--          <div class="summary-row">-->
        <!--            <span class="summary-label">检测结果</span>-->
        <!--            <span class="summary-value">用时：<span class="highlight">{{ detectionTime }}</span> s</span>-->
        <!--          </div>-->
        <!--          <div class="summary-row">-->
        <!--            <span class="summary-value">目标数目：<span class="highlight">{{ filteredResults.length }}</span></span>-->
        <!--            <div class="target-selection">-->
        <!--              <span class="summary-label">目标选择：</span>-->
        <!--              <select v-model="targetSelection" class="tech-select">-->
        <!--                <option value="all">全部</option>-->
        <!--                <option value="eyes">闭眼</option>-->
        <!--                <option value="phone">电话</option>-->
        <!--              </select>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div class="section-title">-->
        <!--          <span>眼动检测结果：</span>-->
        <!--          <div class="title-decoration"></div>-->
        <!--        </div>-->
        <!--        <div class="detection-details">-->
        <!--          <div class="detail-section">-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">置信度：</span>-->
        <!--              <span class="detail-value highlight">-->
        <!--                {{ selectedDetection.confidence || '&#45;&#45;' }}%-->
        <!--              </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">视线方向：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.gazeDirection ? `[${selectedDetection.gazeDirection.join(', ')}]` : '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">注视落点：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.fixationPoint ? `(${selectedDetection.fixationPoint.join(', ')})` : '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">瞳孔直径：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.pupilDiameter ? `${selectedDetection.pupilDiameter} mm` : '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">注视对象：</span>-->
        <!--              <span class="detail-value">{{ selectedDetection.gazeObject || '&#45;&#45;' }}</span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div class="section-title">-->
        <!--          <span>疲劳检测结果：</span>-->
        <!--          <div class="title-decoration"></div>-->
        <!--        </div>-->
        <!--        <div class="detection-details">-->
        <!--          <div class="detail-section">-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">类型：</span>-->
        <!--              <span :class="getClassColor(selectedDetection.class)" class="detail-value">-->
        <!--                {{ selectedDetection.class || '&#45;&#45;' }}-->
        <!--              </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">疲劳程度：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.fatigueLevel || '&#45;&#45;' }}%-->
        <!--      <span v-if="selectedDetection.fatigueLevel" class="fatigue-indicator"-->
        <!--            :style="{width: `${selectedDetection.fatigueLevel}%`}"></span>-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">疲劳类型：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.fatigueType || '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">持续时间：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.fatigueDuration ? `${selectedDetection.fatigueDuration}s` : '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--            <div class="detail-title">-->
        <!--              <span class="title-text">眨眼频率：</span>-->
        <!--              <span class="detail-value">-->
        <!--      {{ selectedDetection.blinkFrequency ? `${selectedDetection.blinkFrequency}次/分钟` : '&#45;&#45;' }}-->
        <!--    </span>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <div class="section-title">
          <span>眼动检测结果：</span>
          <div class="title-decoration"></div>
        </div>
        <div class="detection-cards">
          <div class="tech-card">
            <div class="card-title">置信度</div>
            <div class="card-value highlight">{{ selectedDetection.confidence || '--' }}%</div>
          </div>
          <div class="tech-card">
            <div class="card-title">瞳孔直径</div>
            <div class="card-value">
              {{ selectedDetection.pupilDiameter ? `${selectedDetection.pupilDiameter} mm` : '--' }}
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">注视对象</div>
            <div class="card-value">{{ selectedDetection.gazeObject || '--' }}</div>
          </div>
          <div class="tech-card">
            <div class="card-title">视线方向</div>
            <div class="card-value">
              {{ selectedDetection.gazeDirection ? `[${selectedDetection.gazeDirection.join(', ')}]` : '--' }}
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">注视落点</div>
            <div class="card-value">
              {{ selectedDetection.fixationPoint ? `(${selectedDetection.fixationPoint.join(', ')})` : '--' }}
            </div>
          </div>
        </div>

        <div class="section-title">
          <span>疲劳检测结果：</span>
          <div class="title-decoration"></div>
        </div>
        <div class="detection-cards">
          <div class="tech-card">
            <div class="card-title">类型</div>
            <div :class="['card-value', getClassColor(selectedDetection.class)]">
              {{ selectedDetection.class || '--' }}
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">持续时间</div>
            <div class="card-value">
              {{ selectedDetection.fatigueDuration ? `${selectedDetection.fatigueDuration}s` : '--' }}
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">眨眼频率</div>
            <div class="card-value">
              {{ selectedDetection.blinkFrequency ? `${selectedDetection.blinkFrequency}次/分钟` : '--' }}
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">疲劳程度</div>
            <div class="card-value">
              {{ selectedDetection.fatigueLevel || '--' }}%
              <div v-if="selectedDetection.fatigueLevel" class="progress-bar">
                <div class="progress-fill" :style="{width: `${selectedDetection.fatigueLevel}%`}"></div>
              </div>
            </div>
          </div>
          <div class="tech-card">
            <div class="card-title">疲劳类型</div>
            <div class="card-value" :style="{color: getFatigueColor(selectedDetection.fatigueLevel)}">
              {{ selectedDetection.fatigueType || '--' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import VideoAPI from "@/api/video";
import {TOKEN} from "@/enums/CacheEnum";

const props = defineProps({
  videoId: {
    type: Number,
    default: undefined
  }
})

interface DetectionResult {
  path: string
  class: string
  confidence: number
  coordinates: number[]
  gazeDirection?: [number, number] // 视线方向 [x,y]
  fixationPoint?: [number, number] // 注视落点 [x,y]
  pupilDiameter?: number // 瞳孔直径(mm)
  gazeObject?: string // 注视对象
  fatigueLevel?: number // 疲劳程度(0-100)
  fatigueType?: string // 疲劳类型
  fatigueDuration?: number // 疲劳持续时间(秒)
  blinkFrequency?: number // 眨眼频率(次/分钟)
}

// 检测结果数据
const detectionResults = reactive<DetectionResult[]>([
  {
    path: 'D:/driver-action-Detection/driver-001.jpg',
    class: '闭眼',
    confidence: 94.12,
    coordinates: [204, 232, 262, 274],
    gazeDirection: [0.12, -0.08],
    fixationPoint: [320, 240],
    pupilDiameter: 3.8,
    gazeObject: '仪表盘',
    fatigueLevel: 68,
    fatigueType: '中度疲劳',
    fatigueDuration: 3.5,
    blinkFrequency: 9
  },
  {
    path: 'D:/driver-action-Detection/driver-002.jpg',
    class: '电话',
    confidence: 92.78,
    coordinates: [149, 326, 304, 472],
    gazeDirection: [0.22, -0.43],
    fixationPoint: [434, 634],
    pupilDiameter: 3.6,
    gazeObject: '方向盘',
    fatigueLevel: 64,
    fatigueType: '轻度疲劳',
    fatigueDuration: 15.2,
    blinkFrequency: 12
  },
  {
    path: 'D:/driver-action-Detection/driver-003.jpg',
    class: '闭眼',
    confidence: 92.50,
    coordinates: [284, 226, 336, 266],
    gazeDirection: [0.22, -0.43],
    fixationPoint: [434, 634],
    pupilDiameter: 3.6,
    gazeObject: '方向盘',
    fatigueLevel: 88,
    fatigueType: '中度疲劳',
    fatigueDuration: 20.3,
    blinkFrequency: 10
  }
])

// 当前选中的检测结果索引
const activeIndex = ref<number>(0)
// 选中的检测结果
const selectedDetection = ref<DetectionResult>(detectionResults[0])
// 检测用时
const detectionTime = ref<number>(0.146)
// 是否显示标签
const showLabels = ref<boolean>(true)
// 目标选择
const targetSelection = ref<string>('all')

// 根据选择筛选结果
const filteredResults = computed(() => {
  if (targetSelection.value === 'all') return detectionResults
  return detectionResults.filter(item =>
      targetSelection.value === 'eyes' ? item.class === '闭眼' : item.class === '电话'
  )
})

// 选择检测结果
const selectDetection = (index: number) => {
  activeIndex.value = index
  selectedDetection.value = filteredResults.value[index]
}

// 根据类别获取颜色类
const getClassColor = (cls: string) => {
  if (!cls) return ''
  return cls === '闭眼' ? 'eyes-class' : 'phone-class'
}

// 截断文件路径显示
const truncatePath = (path: string): string => {
  if (path.length > 30) {
    return path.substring(0, 15) + '...' + path.substring(path.length - 15)
  }
  return path
}

// 格式化坐标显示
const formatCoordinates = (coords: number[]): string => {
  if (!coords || coords.length !== 4) return '--'
  return `[${coords.join(', ')}]`
}

// 根据疲劳程度获取颜色
const getFatigueColor = (level?: number) => {
  if (!level) return '#e0e0e0'; // 默认颜色
  if (level < 30) return '#55ff55'; // 轻度 - 绿色
  if (level < 70) return '#ffaa00'; // 中度 - 橙色
  return '#ff5555'; // 重度 - 红色
}


// 操作按钮方法
const openImage = () => console.log('打开图片')
const openFolder = () => console.log('打开文件夹')
const openVideo = () => console.log('打开视频')
const openCamera = () => console.log('打开摄像头')
const saveResults = () => console.log('保存结果')
const exit = () => console.log('退出')
const videoSrc = ref<string>();

onMounted(() => {
  console.log(props.videoId)
  videoSrc.value = `http://localhost:8080/api/v1/video/stream/30`
})
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

@keyframes neonGlow {
  0%, 100% {
    text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff;
  }
  50% {
    text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
  }
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.tech-detection-container {
  font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #e0e0e0;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  h2 {
    margin-top: 0;
    color: $primary-color;
    border-bottom: 1px solid $border-color;
    padding-bottom: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-align: center;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 0;
  }

  .header {
    background: linear-gradient(to right, #0a0a20, #121230);
    color: #4facfe;
    padding: 0 25px 10px 25px;
    //border-bottom: 1px solid #4facfe;
    position: relative;
    z-index: 1;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 1px;
      animation: neonGlow 3s infinite;
    }

    .system-info {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-top: 8px;
      color: #a0f0f0;
    }

    .tech-decoration {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, #4facfe, transparent);
    }
  }
}

.content {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 15px;
  position: relative;
  z-index: 1;

  .left-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
}

.section-title {
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00ccff;

  .title-decoration {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #4facfe, transparent);
  }
}

.video-box {
  aspect-ratio: 16 / 9;
  max-width: 100%;
  height: auto;
  border-radius: 5px;

  img {
    width: 100%;
    height: 100%;
  }
}

.detection-table {
  flex: 1;
  background: rgba(20, 20, 40, 0.7);
  border-radius: 5px;
  padding: 10px;
  overflow: auto;
  border: 1px solid #2a2a4a;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent, rgba(0, 255, 255, 0.05), transparent);
    pointer-events: none;
    z-index: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    position: relative;
    z-index: 1;

    th, td {
      padding: 10px 15px;
      text-align: left;
      border-bottom: 1px solid #2a2a4a;
    }

    th {
      background-color: rgba(0, 100, 150, 0.3);
      font-weight: 500;
      color: #00ccff;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 0.5px;
    }

    tr:hover {
      background-color: rgba(0, 150, 200, 0.1);
    }

    tr.active {
      background-color: rgba(0, 200, 255, 0.15);
      box-shadow: inset 0 0 10px rgba(0, 200, 255, 0.3);
    }

    .index-cell {
      color: #00ccff;
      font-weight: 500;
    }

    .file-path {
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #a0a0f0;
    }

    .eyes-class {
      color: #ff5555;
      font-weight: 500;
    }

    .phone-class {
      color: #55ff55;
      font-weight: 500;
    }

    .confidence-cell {
      color: #ffff55;
      font-weight: 500;
    }

    .coordinates-cell {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #a0f0f0;
    }
  }
}

.detection-settings {
  background: rgba(20, 20, 40, 0.7);
  border-radius: 5px;
  padding: 15px;
  border: 1px solid #2a2a4a;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);

  .settings-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .param-item {
    display: flex;
    align-items: center;
    gap: 5px;

    .param-name {
      color: #a0a0f0;
    }

    .param-value {
      color: #ffff55;
      font-weight: 500;
    }
  }

  .checkbox-row {
    margin-top: 15px;
  }

  .tech-checkbox {
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    user-select: none;
    color: #e0e0e0;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      height: 18px;
      width: 18px;
      background-color: transparent;
      border: 2px solid #4facfe;
      border-radius: 3px;
      margin-right: 10px;
      position: relative;
      transition: all 0.3s;

      &::after {
        content: "";
        position: absolute;
        display: none;
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid #4facfe;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    input:checked ~ .checkmark {
      background-color: rgba(0, 255, 255, 0.2);

      &::after {
        display: block;
      }
    }

    &:hover input ~ .checkmark {
      box-shadow: 0 0 5px #4facfe;
    }
  }
}

.detection-details {
  background: rgba(20, 20, 40, 0.7);
  border-radius: 5px;
  padding: 20px;
  flex: 1;
  border: 1px solid #2a2a4a;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #4facfe, transparent);
  }

  .detail-section {
    margin-bottom: 25px;

    .detail-title {
      font-size: 16px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      .title-text {
        color: #a0a0f0;
      }

      .detail-value {
        margin-left: 10px;
        font-weight: 500;
      }

      .highlight {
        color: #4facfe;
      }
    }
  }

  .position-section {
    .position-coordinates {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 15px;

      .coordinate-row {
        display: flex;
        justify-content: space-between;
      }

      .coord-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(0, 50, 80, 0.3);
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid #2a4a6a;

        .coord-label {
          color: #a0a0f0;
        }

        .coord-value {
          color: #4facfe;
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

.detection-summary {
  background: rgba(20, 20, 40, 0.7);
  border-radius: 5px;
  padding: 15px;
  border: 1px solid #2a2a4a;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;

    .summary-label {
      color: #a0a0f0;
    }

    .summary-value {
      color: #e0e0e0;

      .highlight {
        color: #4facfe;
        font-weight: 500;
      }
    }

    .target-selection {
      display: flex;
      align-items: center;
      gap: 10px;

      .tech-select {
        background: rgba(10, 10, 30, 0.8);
        border: 1px solid #4facfe;
        color: #e0e0e0;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
        }

        &:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
        }
      }
    }
  }
}

/**
 * 操作按钮样式
 */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  background: rgba(20, 20, 40, 0.7);
  border-radius: 5px;
  padding: 10px;
  border: 1px solid #2a2a4a;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);

  .tech-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 5px 15px;
    background: linear-gradient(to bottom, #1a1a3a, #0a0a2a);
    color: #e0e0e0;
    border: 1px solid #3a3a6a;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
              to bottom right,
              transparent,
              transparent,
              transparent,
              rgba(0, 255, 255, 0.1),
              transparent
      );
      transform: rotate(30deg);
      transition: all 0.5s;
    }

    &:hover {
      border-color: #4facfe;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);

      &::before {
        transform: rotate(30deg) translate(20%, 20%);
      }
    }

    &:active {
      transform: translateY(1px);
    }

    .button-icon {
      font-size: 14px;
    }

    .button-text {
      font-size: 14px;
    }

    &.primary {
      background: linear-gradient(to bottom, #0066cc, #004499);
      border-color: #00aaff;

      &:hover {
        box-shadow: 0 0 15px rgba(0, 170, 255, 0.5);
      }
    }

    &.danger {
      background: linear-gradient(to bottom, #cc3300, #992200);
      border-color: #ff5555;

      &:hover {
        box-shadow: 0 0 15px rgba(255, 85, 85, 0.5);
      }
    }
  }
}

.detection-cards {
  //display: grid;
  //grid-template-columns: repeat(3, 1fr);
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tech-card {
  background: rgba(20, 20, 40, 0.7);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid $border-color;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  min-width: 180px;
  flex: 1;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, transparent, $primary-color, transparent);
  }
}

.card-title {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 10px;
  text-align: center;
}

.card-value {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  color: $text-color;

  &.highlight {
    color: $primary-color;
    font-size: 20px;
  }

  &.eyes-class {
    color: #ff5555;
  }

  &.phone-class {
    color: #55ff55;
  }
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  max-width: 120px;
  margin: 5px auto;

  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, $primary-color, $accent-color);
    border-radius: 2px;
  }
}

@media (min-width: 1680px) {
  .action-buttons {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .tech-button {
      padding: 10px 20px;
      font-size: 16px;
    }
  }

}
</style>
