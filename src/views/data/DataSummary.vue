<template>
  <div class="dashboard-container">
    <!-- 标题区域 -->
    <!-- <div class="header">
      <h1>飞行员疲劳状态智能评估数字孪生平台</h1>
      <div class="time-display">{{ currentTime }}</div>
    </div> -->

    <!-- 数据概览区域 -->
    <div class="overview">
      <div class="overview-item">
        <div class="value">{{ totalExperiments }}</div>
        <div class="label">累计实验次数</div>
      </div>
      <div class="overview-item">
        <div class="value">{{ todayExperiments }}</div>
        <div class="label">今日实验次数</div>
      </div>
      <div class="overview-item">
        <div class="value">{{ warningCount }}</div>
        <div class="label">预警次数</div>
      </div>
      <div class="overview-item">
        <div class="value">{{ avgFatigueLevel }}%</div>
        <div class="label">平均疲劳度</div>
      </div>
    </div>

    <!-- 主图表区域 -->
    <div class="main-content">
      <!-- 左侧图表 -->
      <div class="chart-left">
        <div class="chart-container">
          <div class="chart-title">疲劳度趋势分析</div>
          <div ref="fatigueChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <div class="chart-title">眼动类型分布</div>
          <div ref="gazeTypeChart" class="chart"></div>
        </div>
      </div>

      <!-- 中间图表 -->
      <div class="chart-center">
        <div class="chart-container">
          <div class="chart-title">视线热力图</div>
          <div ref="heatmapChart" class="chart"></div>
        </div>
      </div>

      <!-- 右侧图表 -->
      <div class="chart-right">
        <div class="chart-container">
          <div class="chart-title">注视对象分布</div>
          <div ref="gazeObjectChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <div class="chart-title">预警状态统计</div>
          <div ref="alertChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 底部数据表格 -->
    <!-- <div class="data-table">
      <div class="table-title">近期实验数据</div>
      <el-table :data="recentExperiments" style="width: 100%">
        <el-table-column prop="id" label="实验ID" width="100"></el-table-column>
        <el-table-column prop="name" label="实验名称" width="180"></el-table-column>
        <el-table-column prop="time" label="实验时间" width="180"></el-table-column>
        <el-table-column prop="fatigue" label="疲劳度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.fatigue * 100" :color="getFatigueColor(row.fatigue)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div> -->
  </div>  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// 图表引用
const fatigueChart = ref<HTMLElement | null>(null)
const gazeTypeChart = ref<HTMLElement | null>(null)
const heatmapChart = ref<HTMLElement | null>(null)
const gazeObjectChart = ref<HTMLElement | null>(null)
const alertChart = ref<HTMLElement | null>(null)

// 图表实例
let fatigueChartInstance: ECharts | null = null
let gazeTypeChartInstance: ECharts | null = null
let heatmapChartInstance: ECharts | null = null
let gazeObjectChartInstance: ECharts | null = null
let alertChartInstance: ECharts | null = null

// 数据
const currentTime = ref('')
const totalExperiments = ref(128)
const todayExperiments = ref(5)
const warningCount = ref(23)
const avgFatigueLevel = ref(34.5)

const recentExperiments = ref([
  { id: 1001, name: '模拟飞行-昼间', time: '2023-11-15 09:30', fatigue: 0.32, status: 'normal' },
  { id: 1003, name: '模拟飞行-长途', time: '2023-11-14 10:00', fatigue: 0.78, status: 'critical' },
  { id: 1004, name: '模拟飞行-特情', time: '2023-11-14 15:45', fatigue: 0.45, status: 'normal' },
  { id: 1005, name: '模拟飞行-常规', time: '2023-11-13 11:20', fatigue: 0.61, status: 'warning' },
])

// 科技风配色
const techColors = [
  '#00F6FF', // 科技蓝
  '#3A7BD5', // 深科技蓝
  '#00D2FF', // 亮科技蓝
  '#FF6B6B', // 科技红
  '#4ECDC4', // 科技青
  '#45B7D1', // 科技水蓝
  '#F4D03F', // 科技黄
  '#E74C3C', // 科技橙红
]

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

// 初始化图表
const initCharts = () => {
  // 疲劳度趋势图表
  if (fatigueChart.value) {
    fatigueChartInstance = echarts.init(fatigueChart.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0]
        }
      },
      yAxis: {
        type: 'value',
        name: '疲劳度',
        min: 0,
        max: 1,
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0],
          formatter: (value: number) => {
            return (value * 100).toFixed(0) + '%'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 246, 255, 0.2)'
          }
        }
      },
      series: [
        {
          name: '疲劳度',
          type: 'line',
          smooth: true,
          data: [0.2, 0.25, 0.3, 0.45, 0.6, 0.5, 0.3],
          itemStyle: {
            color: techColors[0]
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(0, 246, 255, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(0, 246, 255, 0.1)'
              }
            ])
          }
        }
      ]
    }
    fatigueChartInstance.setOption(option)
  }

  // 眼动类型分布图表
  if (gazeTypeChart.value) {
    gazeTypeChartInstance = echarts.init(gazeTypeChart.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '眼动类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0a2dae',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside', // 将标签位置设置在饼图外部
            formatter: '{b}: {c} ({d}%)', // 格式化标签显示内容
            color: techColors[0] // 设置标签颜色
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: techColors[0]
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 335, name: '注视(fixation)' },
            { value: 310, name: '扫视(saccade)' },
            { value: 234, name: '其他' }
          ],
          color: [techColors[0], techColors[1], techColors[2]]
        }
      ]
    }
    gazeTypeChartInstance.setOption(option)
  }

  // 视线热力图
  if (heatmapChart.value) {
    heatmapChartInstance = echarts.init(heatmapChart.value)

    // 生成模拟数据
    const data: number[][] = []
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        // 生成一些热点区域
        const value = Math.random() * 10
        if ((i === 3 && j === 4) || (i === 7 && j === 2) || (i === 5 && j === 8)) {
          data.push([i, j, value + 15])
        } else {
          data.push([i, j, value])
        }
      }
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top'
      },
      grid: {
        height: '80%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0]
        }
      },
      yAxis: {
        type: 'category',
        data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0]
        }
      },
      visualMap: {
        min: 0,
        max: 25,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#0a2dae', techColors[0], techColors[3]]
        }
      },
      series: [
        {
          name: '注视热度',
          type: 'heatmap',
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    heatmapChartInstance.setOption(option)
  }

  // 注视对象分布图表
  if (gazeObjectChart.value) {
    gazeObjectChartInstance = echarts.init(gazeObjectChart.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0]
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 246, 255, 0.2)'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: ['仪表盘', '导航屏', '外部视野', '控制面板', '通讯设备'],
        axisLine: {
          lineStyle: {
            color: techColors[0]
          }
        },
        axisLabel: {
          color: techColors[0]
        }
      },
      series: [
        {
          name: '注视次数',
          type: 'bar',
          data: [120, 200, 150, 80, 70],
          itemStyle: {
            color: (params: any) => {
              const colorList = [techColors[0], techColors[1], techColors[2], techColors[3], techColors[4]]
              return colorList[params.dataIndex]
            }
          }
        }
      ]
    }
    gazeObjectChartInstance.setOption(option)
  }

  // 预警状态统计图表
  if (alertChart.value) {
    alertChartInstance = echarts.init(alertChart.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '预警状态',
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
          data: [
            { value: 1048, name: '正常' },
            { value: 335, name: '警告' },
            { value: 310, name: '严重' }
          ],
          itemStyle: {
            borderRadius: 5,
            borderColor: '#0a2dae',
            borderWidth: 2,
            color: (params: any) => {
              const colorMap: Record<string, string> = {
                '正常': techColors[0],
                '警告': techColors[3],
                '严重': techColors[7]
              }
              return colorMap[params.name]
            }
          },
          label: {
            color: techColors[0]
          },
          labelLine: {
            lineStyle: {
              color: 'rgba(0, 246, 255, 0.3)'
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    alertChartInstance.setOption(option)
  }
}

// 图表自适应
const resizeCharts = () => {
  fatigueChartInstance?.resize()
  gazeTypeChartInstance?.resize()
  heatmapChartInstance?.resize()
  gazeObjectChartInstance?.resize()
  alertChartInstance?.resize()
}

// 获取疲劳度颜色
const getFatigueColor = (fatigue: number) => {
  if (fatigue < 0.4) return '#00F6FF'
  if (fatigue < 0.7) return '#F4D03F'
  return '#E74C3C'
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'normal': 'success',
    'warning': 'warning',
    'critical': 'danger'
  }
  return map[status] || ''
}

// 生命周期钩子
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  fatigueChartInstance?.dispose()
  gazeTypeChartInstance?.dispose()
  heatmapChartInstance?.dispose()
  gazeObjectChartInstance?.dispose()
  alertChartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: calc(100vh - $title-height-small - 30px);
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="%23001133" /><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="%2300F6FF" stroke-width="0.5" opacity="0.2"/></pattern><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
  color: #00F6FF;
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
  font-family: 'Arial', sans-serif;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 246, 255, 0.3);

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(90deg, #00F6FF, #3A7BD5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(0, 246, 255, 0.3);
    }

    .time-display {
      font-size: 16px;
      color: #00F6FF;
    }
  }

  .overview {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    background: rgba(0, 17, 51, 0.5);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 0 15px rgba(0, 246, 255, 0.1);

    .overview-item {
      text-align: center;
      padding: 0 15px;

      .value {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
        background: linear-gradient(180deg, #00F6FF, #3A7BD5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .label {
        font-size: 14px;
        color: rgba(0, 246, 255, 0.8);
      }
    }
  }

  .main-content {
    display: flex;
    margin-bottom: 20px;
    gap: 15px;
    height: calc(100vh - $title-height-small - 220px);


    .chart-left, .chart-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .chart-center {
      flex: 2;
    }

    .chart-container {
      background: rgba(0, 17, 51, 0.5);
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 0 15px rgba(0, 246, 255, 0.1);
      height: 100%;

      .chart-title {
        font-size: 16px;
        margin-bottom: 10px;
        color: #00F6FF;
        padding-left: 10px;
        border-left: 3px solid #00F6FF;
      }

      .chart {
        width: 100%;
        height: calc(100% - 30px);
      }
    }
  }

  .data-table {
    background: rgba(0, 17, 51, 0.5);
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 0 15px rgba(0, 246, 255, 0.1);

    .table-title {
      font-size: 16px;
      margin-bottom: 15px;
      color: #00F6FF;
      padding-left: 10px;
      border-left: 3px solid #00F6FF;
    }

    :deep(.el-table) {
      background-color: transparent;

      th {
        background-color: rgba(0, 246, 255, 0.1) !important;
        color: #00F6FF;
      }

      tr {
        background-color: transparent;
        color: rgba(0, 246, 255, 0.8);

        &:hover {
          background-color: rgba(0, 246, 255, 0.1) !important;
        }
      }

      td {
        border-bottom: 1px solid rgba(0, 246, 255, 0.1);
      }

      .el-table__empty-block {
        background-color: transparent;
      }
    }

    :deep(.el-progress-bar__outer) {
      background-color: rgba(0, 246, 255, 0.1);
    }
  }
}
</style>
