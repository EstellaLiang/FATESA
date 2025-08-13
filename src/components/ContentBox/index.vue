<template>
  <div class="content-box" :style="{ height: height }">
    <div class="content-box-header">
      <h3>{{ title }}</h3>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="content-box-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'ContentBox',
  props: {
    title: {
      type: String,
      default: '标题'
    },
    height: {
      type: String,
    }
  }
});
</script>

<style scoped lang="scss">
.content-box {
  box-shadow: 0 0 10px rgba(42, 109, 255, 0.1);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content-box-header {
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: url('@/assets/img/sub-title.png');
  background-size: cover;
  background-position: 0 -2px;
  background-repeat: no-repeat;
}

.content-box-header h3 {
  display: block;
  font-size: 16px;
  /* 设置文字为斜体 */
  font-style: italic;
  color: #ebf1f3;
  text-shadow: 3px 3px 6px rgba(0, 0, 128, 0.7), -1px -1px 2px rgba(74, 144, 226, 0.3);
  font-weight: 500;
  padding: 30px;
  line-height: 50px;
}

.content-box-body {
  flex: 1;
  overflow: auto;
  height: 100%;
}
</style>
