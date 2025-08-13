<template>
  <div class="offline-container">
    <el-steps :active="activeStep" finish-status="success" class="workflow-steps" v-show="activeStep !== 2">
      <el-step title="任务配置"/>
      <el-step title="数据上传"/>
      <el-step title="离线检测"/>
    </el-steps>

    <div class="component-wrapper">
      <TaskSetting v-show="activeStep === 0" @next="handleNext"/>
      <DataUpload v-show="activeStep === 1" @next="handleNext" @prev="activeStep--"/>
      <OfflineDetect v-if="activeStep === 2" @restart="activeStep = 0" :videoId="resultVideoId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import TaskSetting from "@/views/offline/component/TaskSetting.vue";
import DataUpload from "@/views/offline/component/DataUpload.vue";
import OfflineDetect from "@/views/offline/component/OfflineDetect.vue";

const activeStep = ref(0);
const resultVideoId = ref<number>();
const handleNext = (videoId) => {
  if (activeStep.value < 2) {
    activeStep.value++;
  }
  resultVideoId.value = videoId;
};
</script>

<style lang="scss" scoped>
.offline-container {
  padding: 20px;
  width: 90vw;
  height: 100%;
  margin: 0 auto;
  overflow: hidden;

  /* 滚动条样式可以保留或移除 */
  &::-webkit-scrollbar {
    display: none; /* 隐藏容器滚动条 */
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
    /* 添加内部滚动 */
    height: calc(100vh - 16rem); /* 根据实际高度调整 */
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(16, 42, 67, 0.4);
      border-radius: 4px;
      margin: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 242, 254, 0.5);
      border-radius: 4px;

      &:hover {
        background: rgba(0, 242, 254, 0.7);
      }
    }
  }
}
</style>
