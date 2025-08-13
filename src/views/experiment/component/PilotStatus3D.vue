<template>
  <div class="pilot-status-3d">
    <div class="panel-header">
      <h3>三维数字孪生驾驶舱</h3>
      <div class="status-indicators">
        <span class="indicator attention">
          <span class="dot"></span>
          注意力集中
        </span>
        <span class="indicator fatigue">
          <span class="dot"></span>
          疲劳状态
        </span>
      </div>
    </div>
    <div ref="chart3d" class="chart-container"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'

export default defineComponent({
  name: 'PilotStatus3D',
  props: {
    pilotData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chart3d = ref<HTMLElement | null>(null)
    let chartInstance: echarts.ECharts | null = null

    const initChart = () => {
      if (!chart3d.value) return

      chartInstance = echarts.init(chart3d.value)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {},
        visualMap: {
          show: false,
          dimension: 2,
          min: 0,
          max: 1,
          inRange: {
            color: [
              '#313695',
              '#4575b4',
              '#74add1',
              '#abd9e9',
              '#e0f3f8',
              '#ffffbf',
              '#fee090',
              '#fdae61',
              '#f46d43',
              '#d73027',
              '#a50026'
            ]
          }
        },
        xAxis3D: {
          type: 'value',
          name: 'X轴',
          axisLine: {
            lineStyle: {
              color: '#4a7bb0'
            }
          },
          axisLabel: {
            textStyle: {
              color: '#8eb8e5'
            }
          }
        },
        yAxis3D: {
          type: 'value',
          name: 'Y轴',
          axisLine: {
            lineStyle: {
              color: '#4a7bb0'
            }
          },
          axisLabel: {
            textStyle: {
              color: '#8eb8e5'
            }
          }
        },
        zAxis3D: {
          type: 'value',
          name: 'Z轴',
          axisLine: {
            lineStyle: {
              color: '#4a7bb0'
            }
          },
          axisLabel: {
            textStyle: {
              color: '#8eb8e5'
            }
          }
        },
        grid3D: {
          viewControl: {
            autoRotate: true,
            autoRotateSpeed: 10,
            distance: 120
          },
          light: {
            main: {
              intensity: 1.2,
              shadow: true,
              shadowQuality: 'high',
              alpha: 30,
              beta: 40
            },
            ambient: {
              intensity: 0.3
            }
          }
        },
        series: [{
          type: 'bar3D',
          data: props.pilotData.instruments.map((item: any, index: number) => {
            return {
              value: [index, item.attentionLevel, 0],
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00b4ff' },
                  { offset: 1, color: '#0066ff' }
                ])
              }
            }
          }),
          shading: 'lambert',
          label: {
            show: true,
            formatter: (params: any) => {
              return props.pilotData.instruments[params.dataIndex].name
            },
            textStyle: {
              color: '#fff',
              fontSize: 10
            }
          },
          emphasis: {
            label: {
              textStyle: {
                fontSize: 12,
                color: '#fff'
              }
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff0' },
                { offset: 1, color: '#f80' }
              ])
            }
          }
        }]
      }

      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    const handleResize = () => {
      chartInstance?.resize()
    }

    watch(() => props.pilotData, () => {
      initChart()
    }, { deep: true })

    return {
      chart3d
    }
  }
})
</script>

<style lang="scss" scoped>
.pilot-status-3d {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba($panel-bg, 0.7);
    border-bottom: 1px solid $border-color;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .status-indicators {
      display: flex;
      gap: 15px;

      .indicator {
        display: flex;
        align-items: center;
        font-size: 12px;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
        }

        &.attention .dot {
          background: $attention-color;
          box-shadow: 0 0 5px $attention-color;
        }

        &.fatigue .dot {
          background: $fatigue-color;
          box-shadow: 0 0 5px $fatigue-color;
        }
      }
    }
  }

  .chart-container {
    flex: 1;
    width: 100%;
  }
}
</style>
