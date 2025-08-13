<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  score: number
  perclos: number
  blinkRate: number
  gazeStability: number
}>()

const fatigueLevel = computed(() => {
  if (props.score <= 30) return 'normal'
  if (props.score <= 70) return 'warning'
  return 'danger'
})

const perclosStatus = computed(() => {
  return props.perclos > 30 ? 'danger' : 'normal'
})

const blinkRateStatus = computed(() => {
  if (props.blinkRate < 8) return 'danger'
  if (props.blinkRate > 20) return 'warning'
  return 'normal'
})

const gazeStabilityStatus = computed(() => {
  return props.gazeStability < 70 ? 'danger' : 'normal'
})

// 预警声音
watch(() => props.score, (newVal) => {
  if (newVal > 70) {
    // 实际项目中应该播放预警音
    console.log('播放严重疲劳预警音')
  } else if (newVal > 30) {
    console.log('播放初级疲劳预警音')
  }
})
</script>

<template>
  <div class="fatigue-container">
    <!-- 疲劳度评分仪表盘 -->
    <div class="fatigue-meter">
      <h2>疲劳度评估</h2>
      <div class="gauge-container">
        <div class="gauge">
          <div
              class="gauge-fill"
              :style="{ transform: `rotate(${score * 1.8 - 90}deg)` }"
              :class="fatigueLevel"
          ></div>
          <div class="gauge-center">
            <div class="score">{{ score.toFixed(2) }}</div>
            <div class="level" :class="fatigueLevel">
              {{ fatigueLevel === 'normal' ? '正常' : fatigueLevel === 'warning' ? '注意' : '危险' }}
            </div>
          </div>
        </div>
        <div class="gauge-labels">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>

    <!-- 预警状态指示灯 -->
    <div class="warning-indicator">
      <div class="led" :class="fatigueLevel"></div>
      <div class="warning-text" :class="fatigueLevel">
        {{ fatigueLevel === 'normal' ? '状态正常' : fatigueLevel === 'warning' ? '初级预警' : '严重疲劳' }}
      </div>
    </div>

    <!-- 关键指标分析 -->
    <div class="key-metrics">
      <h2>关键指标</h2>

      <div class="metric-card" :class="perclosStatus">
        <div class="metric-header">
          <h3>PERCLOS值</h3>
          <div class="metric-value">{{ perclos }}%</div>
        </div>
        <div class="metric-description">
          眼睑闭合时间占比 (阈值: 30%)
        </div>
        <div class="metric-status">
          {{ perclosStatus === 'danger' ? '超过安全阈值' : '正常范围内' }}
        </div>
      </div>

      <div class="metric-card" :class="blinkRateStatus">
        <div class="metric-header">
          <h3>眨眼频率</h3>
          <div class="metric-value">{{ blinkRate }} 次/分钟</div>
        </div>
        <div class="metric-range">
          <div class="range-bar">
            <div
                class="range-fill"
                :style="{ width: `${Math.min(100, (blinkRate / 25) * 100)}%` }"
            ></div>
            <div class="range-safe" style="left: 32%; width: 36%;"></div>
          </div>
          <div class="range-labels">
            <span>0</span>
            <span>8-20</span>
            <span>25</span>
          </div>
        </div>
        <div class="metric-status">
          {{
            blinkRateStatus === 'danger' ? '过低' :
                blinkRateStatus === 'warning' ? '过高' : '正常'
          }}
        </div>
      </div>

      <div class="metric-card" :class="gazeStabilityStatus">
        <div class="metric-header">
          <h3>视线稳定性</h3>
          <div class="metric-value">{{ gazeStability }}%</div>
        </div>
        <div class="stability-bar">
          <div
              class="stability-fill"
              :style="{ width: `${gazeStability}%` }"
          ></div>
        </div>
        <div class="metric-status">
          {{ gazeStabilityStatus === 'danger' ? '注意力分散' : '注意力集中' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fatigue-container {
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

.fatigue-meter {
  margin-bottom: 20px;

  .gauge-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .gauge {
    width: 180px;
    height: 90px;
    position: relative;
    margin-bottom: 10px;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border: 15px solid #1e3a5a;
      border-bottom: none;
      border-radius: 180px 180px 0 0;
      box-sizing: border-box;
    }

    .gauge-fill {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 15px solid;
      border-bottom: none;
      border-radius: 180px 180px 0 0;
      box-sizing: border-box;
      transform-origin: 50% 100%;
      left: 0;
      top: 100%;

      &.normal {
        border-color: #4caf50;
      }

      &.warning {
        border-color: #ff9800;
      }

      &.danger {
        border-color: #f44336;
      }
    }

    .gauge-center {
      position: absolute;
      width: 120px;
      height: 60px;
      background-color: #1e3a5a;
      border-radius: 120px 120px 0 0;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .score {
        font-size: 1.8rem;
        font-weight: bold;
        line-height: 1;
      }

      .level {
        font-size: 0.9rem;
        font-weight: bold;

        &.normal {
          color: #4caf50;
        }

        &.warning {
          color: #ff9800;
        }

        &.danger {
          color: #f44336;
        }
      }
    }
  }

  .gauge-labels {
    display: flex;
    justify-content: space-between;
    width: 180px;
    font-size: 0.8rem;
    color: #90caf9;
  }
}

.warning-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #1e3a5a;
  border-radius: 6px;

  .led {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 10px;
    box-shadow: 0 0 10px;

    &.normal {
      background-color: #4caf50;
      box-shadow: 0 0 10px #4caf50;
    }

    &.warning {
      background-color: #ff9800;
      box-shadow: 0 0 10px #ff9800;
      animation: pulse 1.5s infinite;
    }

    &.danger {
      background-color: #f44336;
      box-shadow: 0 0 10px #f44336;
      animation: pulse 0.75s infinite;
    }
  }

  .warning-text {
    font-weight: bold;
    font-size: 1.1rem;

    &.normal {
      color: #4caf50;
    }

    &.warning {
      color: #ff9800;
    }

    &.danger {
      color: #f44336;
    }
  }
}

.key-metrics {
  .metric-card {
    background-color: #1e3a5a;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid;

    &.normal {
      border-left-color: #4caf50;
    }

    &.warning {
      border-left-color: #ff9800;
    }

    &.danger {
      border-left-color: #f44336;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #90caf9;
      }

      .metric-value {
        font-size: 1.2rem;
        font-weight: bold;
      }
    }

    .metric-description {
      font-size: 0.9rem;
      color: #b0bec5;
      margin-bottom: 10px;
    }

    .metric-range {
      margin: 15px 0;

      .range-bar {
        height: 8px;
        background-color: #0a1a2e;
        border-radius: 4px;
        position: relative;
        overflow: hidden;

        .range-fill {
          height: 100%;
          background-color: #64b5f6;
          border-radius: 4px;
        }

        .range-safe {
          position: absolute;
          top: 0;
          height: 100%;
          background-color: rgba(76, 175, 80, 0.3);
        }
      }

      .range-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #b0bec5;
        margin-top: 5px;
      }
    }

    .stability-bar {
      height: 8px;
      background-color: #0a1a2e;
      border-radius: 4px;
      margin: 15px 0;
      overflow: hidden;

      .stability-fill {
        height: 100%;
        background-color: #64b5f6;
        border-radius: 4px;
      }
    }

    .metric-status {
      font-size: 0.9rem;
      font-weight: bold;
      text-align: right;

      .normal & {
        color: #4caf50;
      }

      .warning & {
        color: #ff9800;
      }

      .danger & {
        color: #f44336;
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
