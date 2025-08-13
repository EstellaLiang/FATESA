<template>
  <div class="report-export-container" :class="activeTypeClass">
    <!-- 左侧：报告参数配置 -->
    <div class="left-panel">
      <div class="panel-title">报告参数配置</div>
      <el-form :model="form" label-width="110px" class="form-panel" :inline="false">
        <el-form-item label="实验/任务">
          <el-select v-model="form.experiments" multiple placeholder="选择实验任务" clearable filterable>
            <el-option v-for="task in experimentOptions" :key="task.value" :label="task.label" :value="task.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="测试人员">
          <el-select v-model="form.userId" placeholder="选择测试人员" clearable filterable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="报告模板">
          <el-select v-model="form.template" placeholder="选择模板">
            <el-option v-for="tpl in templates" :key="tpl.value" :label="tpl.label" :value="tpl.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="包含内容">
          <el-checkbox-group v-model="form.sections" class="section-group">
            <el-checkbox label="overview">数据概览</el-checkbox>
            <el-checkbox label="trajectory">轨迹回放</el-checkbox>
            <el-checkbox label="heatmap">热力图</el-checkbox>
            <el-checkbox label="fatigue">疲劳曲线</el-checkbox>
            <el-checkbox label="cluster">聚类分析</el-checkbox>
            <el-checkbox label="forecast">时序预测</el-checkbox>
            <el-checkbox label="resources">资源性能</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="布局风格">
          <el-radio-group v-model="form.layout">
            <el-radio-button label="compact">简洁</el-radio-button>
            <el-radio-button label="detailed">详细</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="水印文本">
          <el-input v-model="form.watermark" placeholder="如：Confidential / 内部资料" clearable />
        </el-form-item>

        <el-form-item label="电子签名">
          <div class="sign-row">
            <el-switch v-model="form.enableSignature" />
            <el-input v-model="form.signature" placeholder="签名/签章说明" :disabled="!form.enableSignature" />
          </div>
        </el-form-item>

        <div class="action-buttons">
          <div> 
            <el-button type="primary" :icon="Search" @click="handleGenerate">生成预览</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
          <div>
            <el-button type="success" :icon="Download" :disabled="!hasPreview" @click="exportPDF">导出PDF</el-button>
            <el-button :disabled="!hasPreview" @click="exportDOCX">导出Word</el-button>
          </div></div>
      </el-form>
    </div>

    <!-- 右侧：报告预览 -->
    <div class="right-panel">
      <div class="detail-container">
        <div class="panel-title">报告预览</div>
        <div v-if="hasPreview" class="preview-content">
          <div class="report-cover">
            <div class="cover-title">飞行员历史实验数据报告</div>
            <div class="cover-meta">
              <div>模板：{{ currentTemplateLabel }}</div>
              <div>人员：{{ currentUserName }}</div>
              <div>时间：{{ timeRangeText }}</div>
              <div v-if="form.watermark">水印：{{ form.watermark }}</div>
            </div>
            <div class="chip-list">
              <span v-for="chip in sectionChips" :key="chip" class="chip">{{ chip }}</span>
            </div>
          </div>

          <div class="preview-grid">
            <div v-if="form.sections.includes('fatigue')" class="chart-card">
              <div class="card-title">疲劳度趋势</div>
              <div ref="fatigueChartRef" class="chart-box"></div>
            </div>
            <div v-if="form.sections.includes('heatmap')" class="chart-card">
              <div class="card-title">视线热力图</div>
              <div ref="heatmapChartRef" class="chart-box"></div>
            </div>
            <div v-if="form.sections.includes('overview')" class="chart-card">
              <div class="card-title">眼动类型分布</div>
              <div ref="gazeTypeChartRef" class="chart-box"></div>
            </div>
          </div>

          <div v-if="selectedExperiments.length" class="experiment-list">
            <div v-for="exp in selectedExperiments" :key="exp.value" class="experiment-card" :class="exp.type">
              <div class="exp-header">
                <span class="exp-title">{{ exp.label }}</span>
                <span class="type-tag" :class="exp.type">{{ exp.type === 'eye' ? '眼动跟踪' : '疲劳检测' }}</span>
              </div>
              <div class="exp-metrics">
                <template v-if="exp.type === 'eye'">
                  <div class="metric"><span>轨迹点数</span><b>{{ mockEyeMetrics.trailPoints }}</b></div>
                  <div class="metric"><span>平均扫视速度</span><b>{{ mockEyeMetrics.saccadeSpeed }} °/s</b></div>
                  <div class="metric"><span>热点数</span><b>{{ mockEyeMetrics.hotspots }}</b></div>
                </template>
                <template v-else>
                  <div class="metric"><span>平均疲劳度</span><b>{{ mockFatigueMetrics.avgFatigue }}%</b></div>
                  <div class="metric"><span>PERCLOS</span><b>{{ mockFatigueMetrics.perclos }}%</b></div>
                  <div class="metric"><span>眨眼频率</span><b>{{ mockFatigueMetrics.blinkRate }}/min</b></div>
                </template>
              </div>
            </div>
          </div>

          <div v-if="form.enableSignature && form.signature" class="sign-block">
            <span>电子签名：</span>
            <span class="sign-text">{{ form.signature }}</span>
          </div>
        </div>
        <div v-else class="no-data">
          <p>请在左侧配置参数后点击“生成预览”</p>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface User { id: number; name: string }

const users: User[] = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
]

type ExperimentType = 'eye' | 'fatigue'

const experimentOptions: Array<{ label: string; value: string; type: ExperimentType }> = [
  { label: '任务 A-昼间进近', value: 'exp_a', type: 'eye' },
  { label: '任务 B-长途巡航', value: 'exp_b', type: 'fatigue' },
  { label: '任务 C-夜航落地', value: 'exp_c', type: 'eye' }
]

const templates = [
  { label: '航空医学标准模板 A', value: 'aero_a' },
  { label: '航空医学标准模板 B', value: 'aero_b' },
]

const form = ref({
  experiments: [] as string[],
  userId: '' as number | string,
  timeRange: [] as string[],
  template: 'aero_a',
  sections: ['overview', 'fatigue', 'heatmap'] as string[],
  layout: 'compact',
  watermark: '',
  enableSignature: false,
  signature: ''
})

const hasPreview = ref(false)

// 选中实验及类型
const selectedExperiments = computed(() =>
  experimentOptions.filter(opt => form.value.experiments.includes(opt.value))
)

const activeType = computed<ExperimentType | 'mixed'>(() => {
  if (selectedExperiments.value.length === 0) return 'mixed'
  const set = new Set(selectedExperiments.value.map(e => e.type))
  if (set.size === 1) return selectedExperiments.value[0].type
  return 'mixed'
})

const activeTypeClass = computed(() => `type-${activeType.value}`)

// 预览用图表引用与实例
const fatigueChartRef = ref<HTMLElement | null>(null)
const heatmapChartRef = ref<HTMLElement | null>(null)
const gazeTypeChartRef = ref<HTMLElement | null>(null)
let fatigueChart: ECharts | null = null
let heatmapChart: ECharts | null = null
let gazeTypeChart: ECharts | null = null

const currentTemplateLabel = computed(() => templates.find(t => t.value === form.value.template)?.label || '-')
const currentUserName = computed(() => users.find(u => u.id === form.value.userId)?.name || '未选择')
const timeRangeText = computed(() => form.value.timeRange?.length === 2 ? `${form.value.timeRange[0]} 至 ${form.value.timeRange[1]}` : '未选择')
const sectionChips = computed(() => {
  const map: Record<string, string> = {
    overview: '数据概览',
    trajectory: '轨迹回放',
    heatmap: '热力图',
    fatigue: '疲劳曲线',
    cluster: '聚类分析',
    forecast: '时序预测',
    resources: '资源性能'
  }
  return form.value.sections.map(s => map[s]).filter(Boolean)
})

const handleGenerate = async () => {
  if (!form.value.experiments.length || !form.value.timeRange.length) {
    ElMessage.warning('请选择实验任务与时间范围')
    return
  }
  hasPreview.value = true
  await nextTick()
  initOrUpdateCharts()
  ElMessage.success('预览已生成')
}

const handleReset = () => {
  form.value = {
    experiments: [],
    userId: '',
    timeRange: [],
    template: 'aero_a',
    sections: ['overview', 'fatigue', 'heatmap'],
    layout: 'compact',
    watermark: '',
    enableSignature: false,
    signature: ''
  }
  hasPreview.value = false
}

const exportPDF = () => {
  ElMessage.info('将集成为服务端/前端导出。当前为占位实现。')
}

const exportDOCX = () => {
  ElMessage.info('将集成为服务端/前端导出。当前为占位实现。')
}

// 主题色：眼动-蓝青，疲劳-橙红，混合默认蓝青
const themeColors = computed(() => {
  if (activeType.value === 'fatigue') return ['#F4D03F', '#E67E22', '#E74C3C', '#C0392B']
  return ['#00F6FF', '#3A7BD5', '#00D2FF', '#4ECDC4']
})

// 摘要指标（示例数据）
const mockEyeMetrics = computed(() => ({
  trailPoints: 1800 + selectedExperiments.value.length * 120,
  saccadeSpeed: 120 + selectedExperiments.value.length * 8,
  hotspots: 12 + selectedExperiments.value.length * 2
}))

const mockFatigueMetrics = computed(() => ({
  avgFatigue: 38 + selectedExperiments.value.length * 3,
  perclos: 28 + selectedExperiments.value.length * 2,
  blinkRate: 12 + selectedExperiments.value.length
}))

function initOrUpdateCharts() {
  // 疲劳趋势
  if (form.value.sections.includes('fatigue')) {
    if (!fatigueChart && fatigueChartRef.value) {
      fatigueChart = echarts.init(fatigueChartRef.value)
    }
    fatigueChart?.setOption({
      backgroundColor: 'transparent',
      grid: { left: '6%', right: '4%', top: '8%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['起飞', '爬升', '巡航', '下降', '进近', '着陆'],
        axisLine: { lineStyle: { color: themeColors.value[0] } },
        axisLabel: { color: themeColors.value[0] }
      },
      yAxis: {
        type: 'value', min: 0, max: 1,
        axisLine: { lineStyle: { color: themeColors.value[0] } },
        axisLabel: { color: themeColors.value[0], formatter: (v: number) => `${(v*100).toFixed(0)}%` },
        splitLine: { lineStyle: { color: 'rgba(0, 246, 255, 0.15)' } }
      },
      series: [{
        type: 'line', smooth: true,
        data: [0.22, 0.28, 0.35, 0.42, 0.55, 0.48],
        itemStyle: { color: themeColors.value[0] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0,0,0,1,[
            { offset: 0, color: activeType.value==='fatigue' ? 'rgba(244, 208, 63, 0.45)' : 'rgba(0,246,255,0.45)' },
            { offset: 1, color: activeType.value==='fatigue' ? 'rgba(231, 76, 60, 0.08)' : 'rgba(0,246,255,0.08)' }
          ])
        }
      }]
    })
  }

  // 热力图
  if (form.value.sections.includes('heatmap')) {
    if (!heatmapChart && heatmapChartRef.value) {
      heatmapChart = echarts.init(heatmapChartRef.value)
    }
    const data: number[][] = []
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const base = Math.random() * 10
        data.push([i, j, base + (i===3&&j===4 || i===7&&j===2 ? 15 : 0)])
      }
    }
    heatmapChart?.setOption({
      backgroundColor: 'transparent',
      grid: { top: '10%', bottom: '12%', left: '6%', right: '6%' },
      xAxis: { type: 'category', data: Array.from({length:10}, (_,i)=>String(i)), axisLine: { lineStyle: { color: themeColors.value[0] } }, axisLabel: { color: themeColors.value[0] } },
      yAxis: { type: 'category', data: Array.from({length:10}, (_,i)=>String(i)), axisLine: { lineStyle: { color: themeColors.value[0] } }, axisLabel: { color: themeColors.value[0] } },
      visualMap: { min: 0, max: 25, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#0a2dae', themeColors.value[0], activeType.value==='fatigue' ? '#E74C3C' : '#4ECDC4'] } },
      series: [{ type: 'heatmap', data }]
    })
  }

  // 眼动类型分布
  if (form.value.sections.includes('overview')) {
    if (!gazeTypeChart && gazeTypeChartRef.value) {
      gazeTypeChart = echarts.init(gazeTypeChartRef.value)
    }
    gazeTypeChart?.setOption({
      backgroundColor: 'transparent',
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        itemStyle: { borderRadius: 8, borderColor: '#0a2dae', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {c} ({d}%)', color: themeColors.value[0] },
        data: [
          { name: '注视', value: 335 },
          { name: '扫视', value: 310 },
          { name: '其他', value: 154 }
        ],
        color: [themeColors.value[0], themeColors.value[1], themeColors.value[2]]
      }]
    })
  }
}

watch(() => [form.value.sections, hasPreview.value], async () => {
  if (!hasPreview.value) return
  await nextTick()
  initOrUpdateCharts()
})

onMounted(() => {
  // 初次不渲染，待生成预览
})
</script>

<style scoped lang="scss">
.report-export-container {
  box-sizing: border-box;
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(10, 25, 47, 0.9) 0%, rgba(5, 15, 30, 0.95) 100%);
  box-shadow: 0 0 20px rgba(0, 150, 255, 0.15),
              inset 0 0 10px rgba(0, 150, 255, 0.1);
  display: flex;
  gap: 10px;
  overflow: hidden;
  height: calc(100vh - $title-height-small);
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
}

/* 类型主题边框高亮 */
.type-eye {
  border-color: rgba(0, 246, 255, 0.6);
  box-shadow: 0 0 25px rgba(0, 246, 255, 0.2),
              inset 0 0 15px rgba(0, 246, 255, 0.1);
}
.type-fatigue {
  border-color: rgba(231, 76, 60, 0.6);
  box-shadow: 0 0 25px rgba(231, 76, 60, 0.2),
              inset 0 0 15px rgba(231, 76, 60, 0.1);
}
.type-mixed {
  border-color: rgba(77, 179, 255, 0.3);
  box-shadow: 0 0 25px rgba(77, 179, 255, 0.2),
              inset 0 0 15px rgba(77, 179, 255, 0.1);
}

.left-panel {
  width: 420px;
  min-width: 360px;
  background: rgba(5, 20, 40, 0.7);
  border: 1px solid rgba(77, 179, 255, 0.2);
  border-radius: 4px;
  margin: 10px 0 10px 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

.right-panel {
  flex: 1;
  background: rgba(5, 20, 40, 0.7);
  border: 1px solid rgba(77, 179, 255, 0.2);
  border-radius: 4px;
  margin: 10px 10px 10px 0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #00F6FF, transparent);
  }
}

.form-panel {
  .el-form-item{
    min-height: 40px;
  }

  :deep(.el-form-item__label) {
    color: #e8f3ff;
    font-size: 14px;
  }

  :deep(.el-input__wrapper), :deep(.el-select .el-input__wrapper) {
    background: rgba(0, 10, 20, 0.8);
    border-radius: 4px;
    color: #e8f3ff;
    border: 1px solid rgba(77, 179, 255, 0.3);
    box-shadow: 0 0 10px rgba(0, 150, 255, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #00F6FF;
      box-shadow: 0 0 15px rgba(0, 246, 255, 0.3);
    }
  }

  .section-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 12px;
  }

  .sign-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
  
  .el-button {
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(0, 150, 255, 0.3);
    }
  }
}

.detail-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-cover {
  background: linear-gradient(90deg, rgba(10, 73, 134, 0.4), rgba(10, 73, 134, 0.2));
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 4px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(0, 246, 255, 0.1) 0%, transparent 70%);
  }
}
.cover-title {
  font-size: 22px;
  font-weight: 700;
  color: #00F6FF;
  margin-bottom: 12px;
  text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
  letter-spacing: 1px;
}
.cover-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  color: #bfefff;
  font-size: 13px;
  margin-bottom: 12px;
}
.chip-list { 
  margin-top: 12px; 
  display: flex; 
  flex-wrap: wrap; 
  gap: 6px; 
}
.chip {
  background: rgba(0, 150, 255, 0.1);
  border: 1px solid rgba(77, 179, 255, 0.4);
  color: #8edcf1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 246, 255, 0.2);
    transform: translateY(-1px);
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-card {
  background: rgba(0, 17, 51, 0.5);
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 0 15px rgba(0, 246, 255, 0.08);
  border: 1px solid rgba(77, 179, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 246, 255, 0.2);
  }
}
.card-title {
  font-size: 14px;
  color: #00F6FF;
  padding-left: 8px;
  border-left: 3px solid #00F6FF;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.chart-box { 
  width: 100%; 
  height: 220px;
  background: rgba(0, 10, 20, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(77, 179, 255, 0.1);
}

.sign-block {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #bfefff;
  padding: 10px;
  background: rgba(0, 10, 20, 0.5);
  border-radius: 4px;
  border-left: 3px solid #00F6FF;
}
.sign-text { 
  color: #00F6FF; 
  font-weight: 600;
  text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
}

.no-data { 
  color: #a0a0a0; 
  text-align: center; 
  margin-top: 40px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* 实验摘要卡片 */
.experiment-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.experiment-card {
  background: rgba(0, 17, 51, 0.5);
  border: 1px solid rgba(77, 179, 255, 0.3);
  border-radius: 4px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 246, 255, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(0, 246, 255, 0.1) 0%, transparent 70%);
  }
}
.experiment-card.eye { 
  box-shadow: 0 0 15px rgba(0, 246, 255, 0.1);
  border-color: rgba(0, 246, 255, 0.4);
}
.experiment-card.fatigue { 
  box-shadow: 0 0 15px rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.4);
}
.exp-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}
.exp-title { 
  color: #e8f3ff; 
  font-weight: 600;
  letter-spacing: 0.5px;
}
.type-tag { 
  font-size: 12px; 
  padding: 3px 10px; 
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.type-tag.eye { 
  background: rgba(0, 246, 255, 0.15); 
  color: #00F6FF; 
  border: 1px solid rgba(0, 246, 255, 0.4);
  text-shadow: 0 0 5px rgba(0, 246, 255, 0.3);
}
.type-tag.fatigue { 
  background: rgba(231, 76, 60, 0.15); 
  color: #E74C3C; 
  border: 1px solid rgba(231, 76, 60, 0.4);
  text-shadow: 0 0 5px rgba(231, 76, 60, 0.3);
}
.exp-metrics { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(0, 1fr)); 
  gap: 10px;
  position: relative;
  z-index: 1;
}
.metric { 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  background: rgba(0, 10, 20, 0.6); 
  padding: 10px; 
  border-radius: 4px;
  border: 1px solid rgba(77, 179, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 150, 255, 0.1);
    transform: translateY(-2px);
  }
}
.metric span { 
  color: #bfefff; 
  font-size: 12px;
  letter-spacing: 0.5px;
}
.metric b { 
  color: #00F6FF; 
  font-weight: 600;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .report-export-container { 
    flex-direction: column; 
    height: auto; 
    min-height: 600px; 
  }
  .left-panel, .right-panel { 
    margin: 10px; 
    width: auto; 
    min-width: auto; 
  }
  .preview-grid { 
    grid-template-columns: 1fr; 
  }
  .experiment-list { 
    grid-template-columns: 1fr; 
  }
}
</style>


