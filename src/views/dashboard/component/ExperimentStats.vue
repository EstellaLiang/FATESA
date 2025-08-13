<template>
  <div class="experiment-overview dark-tech">
    <div class="stats-grid">
      <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-item"
          :style="{
          '--card-bg': colors[index].bg,
          '--card-border': colors[index].border,
          '--card-glow': colors[index].glow,
          '--number-gradient': numberGradients[index]
        }"
      >
        <div class="stat-value">
          <span class="number">{{ stat.value }}</span>
          <span v-if="stat.unit" class="unit">{{ stat.unit }}</span>
        </div>
        <div class="stat-label">{{ stat.label }}</div>
        <div class="tech-corner"></div>
        <div class="particles"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface StatItem {
  label: string
  value: number | string
  unit?: string
}

// 统计数据
const stats = ref<StatItem[]>([
  { label: '实验总数', value: 42 },
  { label: '今日新增', value: 3 },
  { label: '平均时长', value: 25, unit: 'min' },
  { label: '参与人数', value: 15 }
])

// 深蓝科技风配色方案
const colors = ref([
  { bg: 'rgba(16, 42, 87, 0.6)', border: 'rgba(64, 158, 255, 0.3)', glow: 'rgba(64, 158, 255, 0.5)' },
  { bg: 'rgba(11, 36, 71, 0.6)', border: 'rgba(32, 128, 240, 0.3)', glow: 'rgba(32, 128, 240, 0.5)' },
  { bg: 'rgba(9, 28, 59, 0.6)', border: 'rgba(24, 144, 255, 0.3)', glow: 'rgba(24, 144, 255, 0.5)' },
  { bg: 'rgba(13, 22, 54, 0.6)', border: 'rgba(72, 110, 232, 0.3)', glow: 'rgba(72, 110, 232, 0.5)' }
])

// 彩色数字渐变色方案
const numberGradients = ref([
  'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',  // 蓝-青
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',  // 橙-黄
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',  // 紫-粉
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'   // 绿-青
])

// 暴露方法用于父组件更新数据
defineExpose({
  updateStats: (newStats: StatItem[]) => {
    stats.value = newStats
  }
})
</script>

<style lang="scss" scoped>
.experiment-overview.dark-tech {
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 40, 120, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.8), transparent);
  }

  .title {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #e1f0ff;
    font-weight: 500;
    display: flex;
    align-items: center;
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(64, 158, 255, 0.3);

    .icon {
      margin-right: 10px;
      font-size: 20px;
      filter: drop-shadow(0 0 4px rgba(64, 158, 255, 0.5));
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;

    .stat-item {
      padding: 18px;
      border-radius: 6px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;
      backdrop-filter: blur(5px);
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 1;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px var(--card-glow);
        border-color: rgba(64, 158, 255, 0.5);

        .number {
          text-shadow: 0 0 15px currentColor;
        }

        .particles::before {
          opacity: 0.3;
        }
      }

      .stat-value {
        margin-bottom: 8px;
        line-height: 1;
        position: relative;
        z-index: 2;

        .number {
          font-size: 28px;
          font-weight: 700;
          font-family: 'Arial', sans-serif;
          background: var(--number-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          transition: text-shadow 0.3s ease;
        }

        .unit {
          font-size: 14px;
          color: #a7c4e0;
          margin-left: 4px;
          font-weight: 400;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #a7c4e0;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 2;
      }

      .tech-corner {
        position: absolute;
        width: 12px;
        height: 12px;
        border-style: solid;
        border-color: var(--card-border);
        border-width: 0;
        z-index: 2;

        &:nth-child(1) {
          top: 0;
          left: 0;
          border-top-width: 2px;
          border-left-width: 2px;
        }

        &:nth-child(2) {
          top: 0;
          right: 0;
          border-top-width: 2px;
          border-right-width: 2px;
        }

        &:nth-child(3) {
          bottom: 0;
          right: 0;
          border-bottom-width: 2px;
          border-right-width: 2px;
        }

        &:nth-child(4) {
          bottom: 0;
          left: 0;
          border-bottom-width: 2px;
          border-left-width: 2px;
        }
      }

      .particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
                  circle at center,
                  var(--card-glow) 0%,
                  transparent 70%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .experiment-overview.dark-tech {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 576px) {
  .experiment-overview.dark-tech {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}

/* 数字动画效果 */
@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.number {
  animation: pulse 2s infinite ease-in-out;
}
</style>
