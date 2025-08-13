<template>
  <div class="realtime-detection-container">
    <el-steps :active="activeStep" finish-status="success" class="workflow-steps">
      <el-step title="机组管理" />
      <el-step title="视频配置" />
      <el-step title="实时监测" />
    </el-steps>

    <div class="component-wrapper">
      <CrewManagement
        v-show="activeStep === 0"
        :use-steps="true"
        @next="handleNext"
      />
      <VideoSetup
        v-show="activeStep === 1"
        :use-steps="true"
        @next="handleNext"
        @prev="activeStep--"
      />
      <LiveMonitoring v-if="activeStep === 2" />
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CrewManagement from "@/views/online/component/CrewManagement.vue";
import VideoSetup from "@/views/online/component/VideoSetup.vue";
import LiveMonitoring from "@/views/online/component/LiveMonitoring.vue";

const activeStep = ref(0)
const handleNext = () => {
  if (activeStep.value < 2) {
    activeStep.value++
  }
}
</script>

<style lang="scss" scoped>
.realtime-detection-container {
  padding: 20px;
  width: 90vw;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;

  &::-webkit-scrollbar {
    display: none;
  }

  .workflow-steps {
    margin: 20px auto;
    padding: 20px;
    background: rgba(16, 42, 67, 0.6);
    border-radius: 8px;
    position: sticky;
    top: 0;
    z-index: 10;

    ::v-deep .el-step__title {
      color: #00f2fe;
      font-size: 16px;
    }
  }

  .component-wrapper {
    padding: 20px;
    border: 1px solid rgba(0, 242, 254, 0.3);
    border-radius: 8px;
    background: #0a1a2a;
    height: calc(100vh - 16rem);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }
}
</style>
