<template>
  <div class="experiment-carousel-container">
    <div class="carousel-wrapper">
      <div
          class="carousel-content"
          :style="{ transform: `translateY(${- currentIndex * 120}px)` }"
      >
        <div
            v-for="(experiment, index) in experiments"
            :key="experiment.id"
            class="experiment-item"
            :class="{ 'active': currentIndex === index }"
        >
          <div class="experiment-info">
            <div class="top">
              <div class="title">
                <span class="experiment-id">#{{ experiment.id }}</span>
                <span class="experiment-name">{{ experiment.name }}</span>
              </div>
              <div>
                <span class="status-badge" :class="getStatusClass(experiment)">{{ getStatusText(experiment) }}</span>
              </div>
            </div>
            <p class="experiment-description">{{ experiment.description }}</p>
            <div class="progress">
              <div
                  class="progress-bar"
                  :style="{ width: `${experiment.progress || 0}%` }"
              ></div>
              <span class="progress-text">{{ experiment.progress || 0 }}%</span>
            </div>
            <div class="bottom">
              <div class="meta-info">
                <span class="create-time">
                  <i class="icon-time"></i>
                  {{ formatTime(experiment.create_time) }}
                </span>
              </div>
              <div class="participant-count">
                <i class="icon-user"></i>
                {{ experiment.participants || 0 }}人参与
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="carousel-controls">
      <button @click="prev" class="control-btn prev">
        <i class="icon-arrow-up"></i>
      </button>
      <div class="indicators">
        <span
            v-for="(_, index) in experiments"
            :key="index"
            :class="{ active: currentIndex === index }"
            @click="goTo(index)"
        ></span>
      </div>
      <button @click="next" class="control-btn next">
        <i class="icon-arrow-down"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'

interface Experiment {
  id: number
  name: string
  description: string
  create_time: string | Date
  status?: 'pending' | 'running' | 'completed'
  participants?: number
  progress?: number
}

// 模拟数据 - 实际应用中应该从API获取
const experiments = ref<Experiment[]>([
  {
    id: 1,
    name: '基础视线追踪实验',
    description: '测试飞行员在正常状态下的视线分布模式',
    create_time: new Date('2023-05-10T09:30:00'),
    status: 'running',
    participants: 12,
    progress: 65
  },
  {
    id: 2,
    name: '疲劳状态眼动特征研究',
    description: '研究疲劳状态下眼动扫视模式的变化',
    create_time: new Date('2023-05-11T14:15:00'),
    status: 'pending',
    participants: 8,
    progress: 0
  },
  {
    id: 3,
    name: '紧急情况视觉反应实验',
    description: '测试紧急情况下视觉注意力的转移模式',
    create_time: new Date('2023-05-12T10:00:00'),
    status: 'pending',
    participants: 5,
    progress: 0
  },
  {
    id: 4,
    name: '多任务处理视线分析',
    description: '分析多任务处理时的视线分配策略',
    create_time: new Date('2023-05-09T16:45:00'),
    status: 'completed',
    participants: 15,
    progress: 100
  },
  {
    id: 3,
    name: '紧急情况视觉反应实验',
    description: '测试紧急情况下视觉注意力的转移模式',
    create_time: new Date('2023-05-12T10:00:00'),
    status: 'pending',
    participants: 5,
    progress: 0
  },
  {
    id: 4,
    name: '多任务处理视线分析',
    description: '分析多任务处理时的视线分配策略',
    create_time: new Date('2023-05-09T16:45:00'),
    status: 'completed',
    participants: 15,
    progress: 100
  },
  {
    id: 3,
    name: '紧急情况视觉反应实验',
    description: '测试紧急情况下视觉注意力的转移模式',
    create_time: new Date('2023-05-12T10:00:00'),
    status: 'pending',
    participants: 5,
    progress: 0
  },
  {
    id: 4,
    name: '多任务处理视线分析',
    description: '分析多任务处理时的视线分配策略',
    create_time: new Date('2023-05-09T16:45:00'),
    status: 'completed',
    participants: 15,
    progress: 100
  }
])

const currentIndex = ref(0)
let autoPlayTimer: number | null = null

// 格式化时间显示
const formatTime = (time: string | Date) => {
  const date = typeof time === 'string' ? new Date(time) : time
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 获取实验状态对应的样式类
const getStatusClass = (experiment: Experiment) => {
  return {
    'status-pending': experiment.status === 'pending',
    'status-running': experiment.status === 'running',
    'status-completed': experiment.status === 'completed'
  }
}

// 获取状态显示文本
const getStatusText = (experiment: Experiment) => {
  switch (experiment.status) {
    case 'pending':
      return '待开始'
    case 'running':
      return '进行中'
    case 'completed':
      return '已完成'
    default:
      return '未知状态'
  }
}

// 切换到下一个实验
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % experiments.value.length
  resetAutoPlay()
}

// 切换到上一个实验
const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + experiments.value.length) % experiments.value.length
  resetAutoPlay()
}

// 跳转到指定索引
const goTo = (index: number) => {
  currentIndex.value = index
  resetAutoPlay()
}

// 重置自动播放
const resetAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
  startAutoPlay()
}

// 开始自动播放
const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    next()
  }, 5000) // 5秒切换一次
}

// 组件挂载时开始自动播放
onMounted(() => {
  startAutoPlay()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
})
</script>

<style lang="scss" scoped>
.experiment-carousel-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #fff;
  border: 1px solid rgba(64, 115, 255, 0.3);
  box-shadow: 0 0 15px rgba(64, 115, 255, 0.1);
}

.carousel-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 140px;
}

.carousel-content {
  transition: transform 0.5s ease;
  height: 100%;
}

.experiment-item {
  height: 120px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px;
  background-color: rgba(26, 46, 91, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(64, 115, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &.active {
    border-color: rgba(64, 115, 255, 0.6);
  }
}

.experiment-info {
  display: flex;
  flex-direction: column;

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      display: flex;
      align-items: center
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .meta-info {
      display: flex;
      align-items: center;
    }

    .participant-count {
      display: flex;
      align-items: center;
    }
  }

  .experiment-id {
    font-size: 12px;
    color: #7a9eff;
    background-color: rgba(64, 115, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .experiment-name {
    margin-left: 10px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .experiment-description {
    font-size: 14px;
    color: #a7b9e8;
    line-height: 1.5;
  }

  .status-badge {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;

    &.status-pending {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    &.status-running {
      background-color: rgba(0, 200, 83, 0.1);
      color: #00c853;
    }

    &.status-completed {
      background-color: rgba(64, 115, 255, 0.1);
      color: #7a9eff;
    }
  }

  .meta-info {
    font-size: 12px;

    .create-time {
      color: #8a9cc5;

      .icon-time {
        margin-right: 5px;
      }
    }
  }

  .participant-count {
    font-size: 12px;
    color: #8a9cc5;
    margin-bottom: 8px;

    .icon-user {
      margin-right: 5px;
    }
  }

  .progress {
    margin: 10px 0;
    height: 6px;
    background-color: rgba(64, 115, 255, 0.1);
    border-radius: 3px;

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #1a5eff, #00c8ff);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      right: 0;
      top: -20px;
      font-size: 12px;
      color: #7a9eff;
    }
  }
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;

  .control-btn {
    background: none;
    border: none;
    color: #7a9eff;
    font-size: 16px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(64, 115, 255, 0.1);
      color: #fff;
    }

    &.prev {
      margin-right: 15px;
    }

    &.next {
      margin-left: 15px;
    }
  }

  .indicators {
    display: flex;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(122, 158, 255, 0.3);
      margin: 0 4px;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background-color: #7a9eff;
        transform: scale(1.2);
      }
    }
  }
}

// 图标样式 (可以使用实际图标字体或SVG)
.icon-time:before {
  content: "🕒";
}

.icon-user:before {
  content: "👤";
}
</style>
