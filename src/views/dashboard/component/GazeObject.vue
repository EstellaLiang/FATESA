<template>
  <div class="eye-movement-charts dark-tech">
    <div class="chart-row">
      <div class="chart-container">
        <div ref="gazeObjectChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import type {ECharts} from 'echarts'

// ECharts 实例
const gazeObjectChart = ref<HTMLElement | null>(null)
let gazeObjectChartInstance: ECharts | null = null

// 图表配置
const chartOptions = {
  gazeObject: {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}次 ({d}%)',
      className: 'dark-tooltip'
    },
    series: [{
      name: '热门注视对象',
      type: 'pie',
      radius: '70%',
      roseType: 'radius',
      itemStyle: {
        borderRadius: 6,
        borderColor: '#0a1632',
        borderWidth: 2
      },
      label: {
        color: '#e1f0ff',
        formatter: '{b|{b}}\n{hr|}\n{per|{d}%}',
        rich: {
          b: {
            fontSize: 12,
            lineHeight: 20,
            color: '#e1f0ff'
          },
          hr: {
            borderColor: 'rgba(64, 158, 255, 0.3)',
            width: '100%',
            borderWidth: 1,
            height: 0
          },
          per: {
            color: '#a7c4e0',
            fontSize: 12,
            padding: [4, 4, 4, 4]
          }
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(64, 158, 255, 0.5)'
        }
      },
      data: [
        {value: 45, name: '仪表盘'},
        {value: 32, name: '导航屏幕'},
        {value: 18, name: '控制杆'},
        {value: 12, name: '通讯面板'},
        {value: 8, name: '警示灯'}
      ],
      color: [
        'rgba(64, 158, 255, 0.7)',
        'rgba(100, 220, 180, 0.7)',
        'rgba(250, 200, 88, 0.7)',
        'rgba(238, 102, 102, 0.7)',
        'rgba(160, 120, 255, 0.7)'
      ]
    }]
  }
}

// 初始化图表
const initCharts = () => {
  gazeObjectChartInstance = echarts.init(gazeObjectChart.value)
  gazeObjectChartInstance.setOption(chartOptions.gazeObject)

}

// 响应式调整
const resizeCharts = () => {
  gazeObjectChartInstance?.resize()
}

// 更新数据方法
const updateChartData = (type: 'gazeType', data: any[]) => {
  const chartInstance = gazeObjectChartInstance
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
  gazeObjectChartInstance?.dispose()
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
