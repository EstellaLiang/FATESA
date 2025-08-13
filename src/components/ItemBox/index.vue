<script setup lang="ts">
import {Expand, Fold} from "@element-plus/icons-vue";

const props = defineProps({
  title: {
    type: String,
    default: "请输入标题"
  },
  leftTag: {
    type: Boolean,
    default: false
  },
  rightTag: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: "300px"
  },
  height: {
    type: String,
    default: "400px"
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  }
});

// 根据 defaultExpanded 设置初始值
const isEnter = ref<boolean>(props.defaultExpanded);

function toggleVisible() {
  isEnter.value = !isEnter.value
}
</script>s

<template>
  <div class="main-container">
    <!-- 文本框 -->
    <div class="item-box"
         :class="{'item-box-left': leftTag,'item-box-right': rightTag,
         'slider-enter-left': leftTag && !isEnter, 'slider-enter-right': rightTag && !isEnter,
         'slider-leave-left': leftTag && !isEnter, 'slider-leave-right': rightTag && !isEnter}"
         :style="{width: props.width,height: props.height}">
      <div class="header">
        <el-icon v-if="leftTag" color="#bdeffc" @click="toggleVisible" class="left-icon">
          <Fold v-if="isEnter"/>
          <Expand v-else/>
        </el-icon>
        <span class="title" :class="{ 'left-title': leftTag, 'right-title': rightTag }">{{ title }}</span>
        <el-icon v-if="rightTag" color="#bdeffc" @click="toggleVisible" class="right-icon">
          <Fold v-if="!isEnter"/>
          <Expand v-else/>
        </el-icon>
      </div>
      <!-- 添加插槽 -->
      <div class="slot-container">
        <slot></slot>
      </div>
    </div>

    <!-- <div class="header">
  <span class="title">{{ title }}</span>
  <el-icon color="#bdeffc" @click="toggleVisible">
    <Fold v-if="leftTag"/>
    <Expand v-else/>
  </el-icon>
</div> -->
    <!-- 侧收栏 -->
    <div :class="{left: leftTag, right: rightTag}">
      <div :class="{'side-tag-left': leftTag,'side-tag-right': rightTag,
         'slider-enter-left': leftTag && isEnter, 'slider-enter-right': rightTag && isEnter,
         'slider-leave-left': leftTag && isEnter, 'slider-leave-right': rightTag && isEnter}">
        <el-icon @click="toggleVisible">
          <Fold v-if="rightTag"/>
          <Expand v-else/>
        </el-icon>
        {{ title }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-container {
  position: relative;
}

.item-box {
  background-image: url("@/assets/img/left-box.png");
  background-size: cover;
  background-position: center;
  padding: 12px 20px;
  position: absolute;
  transition: transform 0.5s ease;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;

    .title {
      // 公共样式保持不变
      letter-spacing: 2px;
      font-weight: 600;

      // 新增左右差异样式
      &.left-title {
        font-size: 18px;
      }

      &.right-title {
        font-size: 18px;
      }
    }

    .left-icon {
      order: -1; // 左侧图标在标题前
      margin-right: 12px;
    }

    .right-icon {
      order: 1; // 右侧图标在标题后
      margin-left: 12px;
    }
  }

  .slot-container {
    max-width: 100%; // 限制最大宽度为父元素宽度
    max-height: calc(100% - 40px); // 假设需要减去头部高度，根据实际情况调整
    overflow-y: hidden;
    border-radius: 4px;
  }
}

.item-box-left {
  left: 0;
  border-radius: 10px;
  background: linear-gradient(60deg, #0056b3, #06306c);
  //opacity: 0.9;
  border: 1px solid #409eff;
  padding: 10px 20px 20px 20px;
}

.item-box-right {
  right: 0;
  border-radius: 10px;
  background: linear-gradient(60deg, #0056b3, #06306c);
  //opacity: 0.9;
  padding: 10px 20px 20px 20px;
  border: 1px solid #409eff;
}

.slider-enter-left {
  transform: translateX(100%);
}

.slider-enter-right {
  transform: translateX(-100%);
}

.slider-leave-left {
  transform: translateX(-100%);
}

.slider-leave-right {
  transform: translateX(100%);
}

.left {
  position: absolute;
  left: 0;
}

.right {
  position: absolute;
  right: 0;
  width: auto;
  height: auto;
}


.side-tag-left {
  padding: 4px 2px;
  writing-mode: vertical-lr;
  color: #70bee5;
  letter-spacing: 2px;
  border: 1px solid #70bee5;
  margin-left: -4px;
  border-left: none;
  transition: transform 0.5s ease;
  background-color: #06306c;
}

.side-tag-right {
  padding: 4px 2px;
  writing-mode: vertical-lr;
  color: #70bee5;
  letter-spacing: 2px;
  border: 1px solid #70bee5;
  margin-right: -4px;
  border-right: none;
  transition: transform 0.5s ease;
  background-color: #06306c;
}
</style>
