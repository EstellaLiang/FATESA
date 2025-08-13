<template>
  <div ref="chartContainer" class="fatigue-trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const props = withDefaults(defineProps<{
  data?: number[]
  timeLabels?: string[]
  warningThreshold?: number
  dangerThreshold?: number
}>(), {
  data: () => [],
  timeLabels: () => [],
  warningThreshold: 60,
  dangerThreshold: 80
})

const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

const getChartOption = () => {
  const validData = Array.isArray(props.data) ? props.data : []
  const labels = props.timeLabels?.length === props.data?.length
      ? props.timeLabels
      : validData.map((_, i) => `${i}s`)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const time = labels[params[0].dataIndex] || '未知时间'
        return `时间: ${time}<br/>疲劳度: ${params[0].value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      },
      axisLabel: {
        color: '#999',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#999',
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '疲劳度',
      type: 'line',
      data: validData,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: validData.length < 30,
      lineStyle: {
        width: 3,
        color: '#1890ff'
      },
      itemStyle: {
        color: '#1890ff',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
        ])
      },
      markLine: {
        silent: true,
        data: [
          {
            yAxis: props.warningThreshold,
            lineStyle: {
              color: '#faad14',
              type: 'dashed',
              width: 1
            },
            label: {
              position: 'end',
              formatter: '警戒线',
              color: '#faad14'
            }
          },
          {
            yAxis: props.dangerThreshold,
            lineStyle: {
              color: '#f5222d',
              type: 'dashed',
              width: 1
            },
            label: {
              position: 'end',
              formatter: '危险线',
              color: '#f5222d'
            }
          }
        ]
      }
    }]
  }
}

const initChart = () => {
  if (chartContainer.value) {
    chartInstance = echarts.init(chartContainer.value)
    updateChart()
  }
}

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(getChartOption())
  }
}

const resizeChart = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

watch(
    () => [props.data, props.timeLabels, props.warningThreshold, props.dangerThreshold],
    () => updateChart(),
    { deep: true }
)
</script>

<style scoped>
.fatigue-trend-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
