<template>
  <div class="eye-movement-charts dark-tech">
    <div class="chart-row">
      <div class="chart-container">
        <div ref="gazeTypeChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import type {ECharts} from 'echarts'

// ECharts 实例
const gazeTypeChart = ref<HTMLElement | null>(null)
let gazeTypeChartInstance: ECharts | null = null

// 图表配置
const chartOptions = {
  gazeType: {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)',
      className: 'dark-tooltip'
    },
    series: [{
      name: '眼动类型分布',
      type: 'pie',
      radius: ['50%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0a1632',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b|{b}}\n{hr|}\n{d}%',
        rich: {
          b: {
            color: '#e1f0ff',
            fontSize: 12,
            lineHeight: 20
          },
          hr: {
            borderColor: 'rgba(64, 158, 255, 0.3)',
            width: '100%',
            borderWidth: 1,
            height: 0
          }
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(64, 158, 255, 0.5)'
        },
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold',
          color: '#ffffff'
        }
      },
      data: [
        {value: 68, name: '注视 (Fixation)'},
        {value: 32, name: '扫视 (Saccade)'}
      ],
      color: [
        'rgba(64, 158, 255, 0.7)',
        'rgba(100, 220, 180, 0.7)'
      ]
    }]
  },
}

// 初始化图表
const initCharts = () => {
  gazeTypeChartInstance = echarts.init(gazeTypeChart.value)
  gazeTypeChartInstance.setOption(chartOptions.gazeType)

}

// 响应式调整
const resizeCharts = () => {
  gazeTypeChartInstance?.resize()
}

// 更新数据方法
const updateChartData = (type: 'gazeType', data: any[]) => {
  const chartInstance = gazeTypeChartInstance
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        data: data
      }]
    })
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  gazeTypeChartInstance?.dispose()
})

// 暴露方法
defineExpose({
  updateChartData
})
</script>

<style lang="scss" scoped>
.eye-movement-charts.dark-tech {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 40, 120, 0.3);
  border: 1px solid rgba(64, 158, 255, 0.1);

  .chart-row {
    display: flex;
    gap: 16px;
    width: 100%;

    .chart-container {
      flex: 1;
      background: rgba(16, 42, 87, 0.3);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid rgba(64, 158, 255, 0.1);
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);

      &:hover {
        box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
        border-color: rgba(64, 158, 255, 0.3);
      }

      .chart-title {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #e1f0ff;
        display: flex;
        align-items: center;
        font-weight: 500;

        .icon {
          margin-right: 8px;
          filter: drop-shadow(0 0 4px rgba(64, 158, 255, 0.5));
        }
      }

      .chart {
        width: 100%;
        height: 250px;
      }
    }
  }
}

@media (max-width: 992px) {
  .eye-movement-charts.dark-tech {
    .chart-row {
      flex-direction: column;

      .chart-container {
        width: 100%;
      }
    }
  }
}

/* ECharts 暗黑主题适配 */
:deep(.dark-tooltip) {
  background: rgba(16, 42, 87, 0.9) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  color: #e1f0ff !important;
}
</style>
