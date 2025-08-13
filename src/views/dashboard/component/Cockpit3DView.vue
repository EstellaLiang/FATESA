<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

defineProps<{
  fatigueScore: number
}>()

const showHeatmap = ref(true)
const gazeHistoryDuration = ref(30) // 30秒历史轨迹
const gazePoints = ref<Array<{x: number, y: number, timestamp: number, intensity: number}>>([])

// 生成不规则弧形热力图数据
const heatmapData = computed(() => {
  if (!showHeatmap.value || gazePoints.value.length === 0) return []

  // 按强度分组点
  const highIntensityPoints = gazePoints.value.filter(p => p.intensity > 0.7)
  const mediumIntensityPoints = gazePoints.value.filter(p => p.intensity > 0.4 && p.intensity <= 0.7)
  const lowIntensityPoints = gazePoints.value.filter(p => p.intensity <= 0.4)

  // 生成弧形热力图数据
  const arcs = []

  // 高强度区域 - 红色
  if (highIntensityPoints.length > 0) {
    arcs.push({
      points: generateArcPoints(highIntensityPoints, 8, 15),
      color: 'rgba(244, 67, 54, 0.6)'
    })
  }

  // 中强度区域 - 橙色
  if (mediumIntensityPoints.length > 0) {
    arcs.push({
      points: generateArcPoints(mediumIntensityPoints, 12, 25),
      color: 'rgba(255, 152, 0, 0.4)'
    })
  }

  // 低强度区域 - 绿色
  if (lowIntensityPoints.length > 0) {
    arcs.push({
      points: generateArcPoints(lowIntensityPoints, 15, 35),
      color: 'rgba(76, 175, 80, 0.3)'
    })
  }

  return arcs
})

// 生成不规则弧形点集
function generateArcPoints(points: any[], minRadius: number, maxRadius: number) {
  if (points.length === 0) return []

  // 计算中心点
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length

  // 生成弧形点
  const arcPoints = []
  const steps = 20 + Math.floor(points.length / 2)

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const radius = minRadius + Math.random() * (maxRadius - minRadius)

    // 添加一些不规则性
    const irregularity = 1 + (Math.random() - 0.5) * 0.3

    arcPoints.push({
      x: centerX + Math.cos(angle) * radius * irregularity,
      y: centerY + Math.sin(angle) * radius * irregularity
    })
  }

  // 闭合路径
  arcPoints.push(arcPoints[0])

  return arcPoints
}

// 模拟视线移动
onMounted(() => {
  setInterval(() => {
    // 模拟新的注视点，带有强度值（0-1之间）
    const newPoint = {
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 80 + 10,
      timestamp: Date.now(),
      intensity: Math.random() > 0.7 ? 0.9 : Math.random() * 0.7 // 30%概率高强度注视
    }

    gazePoints.value.push(newPoint)

    // 移除过期的点
    const now = Date.now()
    gazePoints.value = gazePoints.value.filter(
        point => now - point.timestamp < gazeHistoryDuration.value * 1000
    )
  }, 800)
})

const updateGazeHistory = (duration: number) => {
  gazeHistoryDuration.value = duration
}
</script>

<template>
  <div class="cockpit-container">
    <!-- Three.js 容器 -->
    <div class="threejs-view">
      <div class="view-overlay">
        <!-- 不规则弧形热力图 -->
        <svg class="heatmap-svg" width="100%" height="100%">
          <defs>
            <!-- 热力图渐变定义 -->
            <radialGradient
                v-for="(arc, index) in heatmapData"
                :key="'gradient-'+index"
                :id="'heatmap-gradient-'+index"
                cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
            >
              <stop offset="0%" :stop-color="arc.color" stop-opacity="0.8"/>
              <stop offset="100%" :stop-color="arc.color" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- 绘制不规则弧形热力图 -->
          <g v-for="(arc, index) in heatmapData" :key="'arc-'+index">
            <path
                :d="'M' + arc.points.map(p => `${p.x},${p.y}`).join(' L') + ' Z'"
                :fill="'url(#heatmap-gradient-' + index + ')'"
                stroke="none"
            />
          </g>
        </svg>

        <!-- 动态脉冲光圈 -->
        <div
            v-for="(point, index) in gazePoints"
            :key="'point-'+index"
            class="gaze-point"
            :style="{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${8 + (Date.now() - point.timestamp) / 200}px`,
              height: `${8 + (Date.now() - point.timestamp) / 200}px`,
              opacity: 1 - (Date.now() - point.timestamp) / (gazeHistoryDuration.value * 1000),
              backgroundColor: point.intensity > 0.7 ? 'rgba(244, 67, 54, 0.7)' :
                              point.intensity > 0.4 ? 'rgba(255, 152, 0, 0.7)' : 'rgba(76, 175, 80, 0.7)'
            }"
        ></div>

        <!-- 眼动轨迹 - 根据强度改变颜色 -->
        <svg class="gaze-path" width="100%" height="100%">
          <defs>
            <linearGradient id="gazeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                  v-for="(point, index) in gazePoints"
                  :key="'grad-'+index"
                  :offset="`${index / (gazePoints.length - 1) * 100}%`"
                  :stop-color="point.intensity > 0.7 ? 'rgba(244, 67, 54, 0.8)' :
                                point.intensity > 0.4 ? 'rgba(255, 152, 0, 0.8)' : 'rgba(76, 175, 80, 0.8)'"
              />
            </linearGradient>
          </defs>
          <path
              fill="none"
              stroke="url(#gazeGradient)"
              stroke-width="2"
              :d="'M' + gazePoints.map(p => `${p.x},${p.y}`).join(' L')"
          />
        </svg>
      </div>

      <!-- 热力图开关 -->
      <div class="heatmap-toggle">
        <button
            @click="showHeatmap = !showHeatmap"
            :class="{ active: showHeatmap }"
        >
          热力图 {{ showHeatmap ? 'ON' : 'OFF' }}
        </button>
      </div>

      <!-- 轨迹时长控制 -->
      <div class="gaze-history-control">
        <span>轨迹时长:</span>
        <button
            v-for="duration in [10, 20, 30, 60]"
            :key="duration"
            @click="updateGazeHistory(duration)"
            :class="{ active: gazeHistoryDuration === duration }"
        >
          {{ duration }}s
        </button>
      </div>
    </div>

    <!-- 仪表盘指示器 -->
    <div class="instrument-indicators">
      <div class="indicator">
        <div class="label">空速表</div>
        <div class="focus" :class="{ active: fatigueScore > 70 }">注意</div>
      </div>
      <div class="indicator">
        <div class="label">高度计</div>
        <div class="focus" :class="{ active: fatigueScore > 60 }">注意</div>
      </div>
      <div class="indicator">
        <div class="label">姿态仪</div>
        <div class="focus" :class="{ active: fatigueScore > 50 }">注意</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cockpit-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #050e17;
  overflow: hidden;
}

.threejs-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url('@/assets/img/cockpit-bg.png');
  background-size: cover;
  background-position: center;

  .view-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .heatmap-svg {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8;
    z-index: 1;
  }

  .gaze-point {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    box-shadow: 0 0 10px currentColor;
    transition: all 0.3s ease-out;
    z-index: 3;
  }

  .gaze-path {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;

    path {
      transition: all 0.5s ease;
    }
  }
}

.heatmap-toggle {
  position: absolute;
  top: 15px;
  right: 15px;

  button {
    background-color: rgba(26, 58, 90, 0.8);
    color: #e0e0e0;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;

    &.active {
      background-color: rgba(211, 47, 47, 0.8);
      color: white;
    }
  }
}

.gaze-history-control {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  align-items: center;
  background-color: rgba(26, 58, 90, 0.8);
  padding: 5px 10px;
  border-radius: 20px;

  span {
    margin-right: 10px;
    font-size: 0.9rem;
    color: #e0e0e0;
  }

  button {
    background: none;
    border: none;
    color: #90caf9;
    padding: 3px 8px;
    margin: 0 2px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s;

    &.active {
      background-color: #0d47a1;
      color: white;
    }
  }
}

.instrument-indicators {
  position: absolute;
  bottom: 60px;
  right: 15px;
  display: flex;
  gap: 15px;

  .indicator {
    background-color: rgba(26, 58, 90, 0.8);
    padding: 8px 12px;
    border-radius: 6px;
    text-align: center;

    .label {
      font-size: 0.9rem;
      color: #e0e0e0;
      margin-bottom: 5px;
    }

    .focus {
      font-size: 0.8rem;
      color: #81c784;
      font-weight: bold;

      &.active {
        color: #f44336;
        animation: pulse 1.5s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
