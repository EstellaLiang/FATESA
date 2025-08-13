<script setup lang="ts">
import {ref, onMounted} from 'vue'
import PilotOverview from "@/views/dashboard/component/PilotOverview.vue";
import Cockpit3DView from "@/views/dashboard/component/Cockpit3DView.vue";
import FatigueAnalysis from "@/views/dashboard/component/FatigueAnalysis.vue";
import GazePath from "@/views/dashboard/component/GazePath.vue";
// import Cockpit3DView from '@/components/Cockpit3DView.vue'
// import FatigueAnalysis from '@/components/FatigueAnalysis.vue'

// 模拟飞行员数据
const pilotData = ref({
  name: '张伟',
  airline: '空军作战AS42队',
  flightNumber: 'CA1234',
  totalHours: 2345,
  status: '执勤',
  fatigueScore: 68,
  perclos: 28,
  blinkRate: 12,
  gazeStability: 82
})

// 模拟实时数据更新
onMounted(() => {
  setInterval(() => {
    // 这里实际应该从API获取数据
    pilotData.value.fatigueScore = Math.max(0, Math.min(100,
        pilotData.value.fatigueScore + (Math.random() * 4 - 2)))
  }, 2000)
})
</script>

<template>
  <div class="dashboard-container">
    <!--    <div class="dashboard-header">-->
    <!--      <h1>飞行员疲劳状态智能监测系统</h1>-->
    <!--      <div class="status-indicator">-->
    <!--        <span>实时状态: </span>-->
    <!--        <span class="status-badge" :class="pilotData.status === '执勤' ? 'active' : 'resting'">-->
    <!--          {{ pilotData.status }}-->
    <!--        </span>-->
    <!--      </div>-->
    <!--    </div>-->

    <div class="dashboard-main">
      <div class="left-panel">
        <PilotOverview :pilot="pilotData" :fatigueScore="pilotData.fatigueScore"/>
      </div>

      <div class="center-panel">
        <Cockpit3DView :fatigueScore="pilotData.fatigueScore"/>
      </div>

      <div class="right-panel">
        <FatigueAnalysis
            :score="pilotData.fatigueScore"
            :perclos="pilotData.perclos"
            :blinkRate="pilotData.blinkRate"
            :gazeStability="pilotData.gazeStability"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  background-color: #0a1a2e;
  color: #fff;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
  height: calc(100vh - $title-height-small);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: #12263a;
  border-bottom: 1px solid #1e3a5a;

  h1 {
    font-size: 1.5rem;
    margin: 0;
    color: #e0e0e0;
  }
}

.status-indicator {
  display: flex;
  align-items: center;

  .status-badge {
    padding: 5px 10px;
    border-radius: 15px;
    font-weight: bold;
    font-size: 0.9rem;

    &.active {
      background-color: #2e7d32;
      color: #e8f5e9;
    }

    &.resting {
      background-color: #1565c0;
      color: #e3f2fd;
    }
  }
}

.dashboard-main {
  display: flex;
  flex: 1;
  overflow: hidden;

  .left-panel {
    width: 450px;
    background-color: #12263a;
    border-right: 1px solid #1e3a5a;
    overflow-y: auto;
  }

  .center-panel {
    flex: 1;
    background-color: #0a1a2e;
    position: relative;
  }

  .right-panel {
    width: 450px;
    background-color: #12263a;
    border-left: 1px solid #1e3a5a;
    overflow-y: auto;
  }
}

@media (min-width: 1680px) {
  .dashboard-container {
    height: calc(100vh - $title-height-big);
  }
}
</style>
