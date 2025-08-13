<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'

defineProps<{
  fatigueScore: number
}>()

const showHeatmap = ref(true)
const gazeHistoryDuration = ref(30) // 30秒历史轨迹
const gazePoints = ref<Array<{ x: number, y: number, timestamp: number, intensity: number }>>([])

// 模拟视线移动
onMounted(() => {
  setInterval(() => {
    // 模拟新的注视点，带有强度值（0-1之间）
    const newPoint = {
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100, // 0-100%
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
        <!-- 眼动轨迹 - 根据强度改变颜色 -->
        <svg class="gaze-path" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
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
              stroke-width="1.5"
              :d="'M' + gazePoints.map(p => `${p.x},${p.y}`).join(' L')"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cockpit-container {
  width: 100%;
  height: 200px;
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

    .gaze-path {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
