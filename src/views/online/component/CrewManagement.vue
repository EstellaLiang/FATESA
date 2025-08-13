<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {Search, User, Check, X} from 'lucide-vue-next'

interface Pilot {
  id: string
  name: string
  employeeId: string
  flightNumber: string
  status: string
  lastAlert?: string
  heartRate: string
  selected: boolean
}

const router = useRouter()

const props = defineProps<{ useSteps?: boolean }>()
const emit = defineEmits<{ (e: 'next'): void }>()

const searchQuery = ref('')
const isRequestingPermission = ref(false)
const permissionGranted = ref(false)

const pilots = ref<Pilot[]>([
  {
    id: 'p001',
    name: '张伟',
    employeeId: 'CA1001',
    flightNumber: 'CA1234',
    status: '待命',
    lastAlert: '2小时前',
    heartRate: '72bpm (正常)',
    selected: false
  },
  {
    id: 'p002',
    name: '李娜',
    employeeId: 'CA1002',
    flightNumber: 'CA5678',
    status: '飞行中',
    lastAlert: '30分钟前',
    heartRate: '88bpm (偏高)',
    selected: false
  },
  {
    id: 'p003',
    name: '王强',
    employeeId: 'CA1003',
    flightNumber: 'CA9012',
    status: '休息中',
    heartRate: '65bpm (正常)',
    selected: false
  },
  {
    id: 'p004',
    name: '赵敏',
    employeeId: 'CA1004',
    flightNumber: 'CA3456',
    status: '待命',
    lastAlert: '1小时前',
    heartRate: '76bpm (正常)',
    selected: false
  },
  {
    id: 'p005',
    name: '刘洋',
    employeeId: 'CA1005',
    flightNumber: 'CA7890',
    status: '飞行中',
    heartRate: '82bpm (正常)',
    selected: false
  }
])

const filteredPilots = computed(() => {
  return pilots.value.filter(pilot =>
      pilot.name.includes(searchQuery.value) ||
      pilot.employeeId.includes(searchQuery.value) ||
      pilot.flightNumber.includes(searchQuery.value)
  )
})

const selectedCount = computed(() => {
  return pilots.value.filter(p => p.selected).length
})

const startMonitoring = () => {
  const selectedPilots = pilots.value.filter(p => p.selected)
  if (selectedPilots.length === 0) return

  isRequestingPermission.value = true

  // 模拟权限请求
  setTimeout(() => {
    permissionGranted.value = true
    isRequestingPermission.value = false
    if (props.useSteps) {
      emit('next')
    } else {
      router.push('/video-setup')
    }
  }, 2000)
}
</script>

<template>
  <div class="crew-management">
    <div class="header">
      <h1>机组管理</h1>
      <div class="search-bar">
        <Search :size="18" class="search-icon"/>
        <input
            v-model="searchQuery"
            placeholder="搜索飞行员姓名、工号或航班号..."
            type="text"
        />
      </div>
    </div>

    <div class="pilot-list">
      <div class="list-header">
        <div class="header-item" style="flex: 0.5">选择</div>
        <div class="header-item" style="flex: 2">姓名</div>
        <div class="header-item" style="flex: 1.5">工号</div>
        <div class="header-item" style="flex: 1.5">当前航班</div>
        <div class="header-item" style="flex: 2">生理状态</div>
        <div class="header-item" style="flex: 2">上次预警</div>
      </div>

      <div
          v-for="pilot in filteredPilots"
          :key="pilot.id"
          class="pilot-item"
          :class="{ selected: pilot.selected }"
      >
        <div class="item-cell" style="flex: 0.5">
          <input
              type="checkbox"
              v-model="pilot.selected"
              :disabled="selectedCount >= 4 && !pilot.selected"
              class="tech-checkbox"
          />
        </div>
        <div class="item-cell" style="flex: 2">
          <User :size="16" class="user-icon"/>
          {{ pilot.name }}
        </div>
        <div class="item-cell" style="flex: 1.5">{{ pilot.employeeId }}</div>
        <div class="item-cell" style="flex: 1.5">{{ pilot.flightNumber }}</div>
        <div class="item-cell" style="flex: 2">
          <span class="heart-rate" :class="{
            'normal': pilot.heartRate.includes('正常'),
            'warning': pilot.heartRate.includes('偏高')
          }">
            {{ pilot.heartRate }}
          </span>
        </div>
        <div class="item-cell" style="flex: 2">
          <span v-if="pilot.lastAlert" class="alert-badge">
            {{ pilot.lastAlert }}
          </span>
          <span v-else class="no-alert">无预警记录</span>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <div class="selection-info">
        已选择 {{ selectedCount }} 名飞行员 (最多4名)
      </div>
      <button
          class="start-button"
          :disabled="selectedCount === 0"
          @click="startMonitoring"
      >
        启动实时监测
        <span class="button-pulse"></span>
      </button>
    </div>

    <!-- 权限请求对话框 -->
    <div v-if="isRequestingPermission" class="permission-dialog">
      <div class="dialog-content">
        <h3>正在请求监测权限...</h3>
        <p>已向选中的飞行员发送监测请求，请等待确认</p>
        <div class="tech-spinner"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$title-height-small: 80px;
$primary-color: #00f0ff;
$secondary-color: #0055ff;
$dark-bg: #0a192f;
$card-bg: #172a45;
$text-color: #e6f1ff;
$accent-color: #64ffda;

.crew-management {
  padding: 20px;
  height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
  background-color: $dark-bg;
  color: $text-color;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.8rem;
    color: $primary-color;
    //margin-bottom: 15px;
    font-weight: 500;
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  }
}

.search-bar {
  position: relative;
  max-width: 600px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $primary-color;
  }

  input {
    width: 100%;
    padding: 10px 15px 10px 40px;
    border: 1px solid rgba($primary-color, 0.3);
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.3s;
    background-color: rgba($card-bg, 0.8);
    color: $text-color;
    box-shadow: 0 0 15px rgba(0, 95, 255, 0.1);

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.2),
      0 0 20px rgba(0, 95, 255, 0.3);
    }

    &::placeholder {
      color: rgba($text-color, 0.5);
    }
  }
}

.pilot-list {
  flex: 1;
  overflow-y: auto;
  background-color: $card-bg;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($primary-color, 0.1);
}

.list-header {
  display: flex;
  padding: 15px 20px;
  background-color: rgba($primary-color, 0.05);
  border-bottom: 1px solid rgba($primary-color, 0.1);
  font-weight: 600;
  color: $primary-color;
  position: sticky;
  top: 0;
  z-index: 1;
  backdrop-filter: blur(5px);
}

.pilot-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid rgba($primary-color, 0.05);
  transition: all 0.2s;

  &:hover {
    background-color: rgba($primary-color, 0.03);
  }

  &.selected {
    background-color: rgba($primary-color, 0.08);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 2px;
      background: linear-gradient(to bottom, $primary-color, $secondary-color);
    }
  }
}

.item-cell {
  display: flex;
  align-items: center;
  padding: 0 5px;

  .user-icon {
    margin-right: 8px;
    color: $accent-color;
  }

  .alert-badge {
    background-color: rgba(255, 50, 50, 0.15);
    color: #ff5e5e;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    border: 1px solid rgba(255, 50, 50, 0.3);
  }

  .no-alert {
    color: rgba($text-color, 0.6);
    font-size: 0.85rem;
  }

  .heart-rate {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    border: 1px solid transparent;

    &.normal {
      background-color: rgba(100, 255, 218, 0.1);
      color: $accent-color;
      border-color: rgba(100, 255, 218, 0.3);
    }

    &.warning {
      background-color: rgba(255, 150, 50, 0.15);
      color: #ffaa64;
      border-color: rgba(255, 150, 50, 0.3);
    }
  }
}

.tech-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid $primary-color;
  border-radius: 3px;
  background-color: transparent;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:checked {
    background-color: $primary-color;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 1px;
      width: 5px;
      height: 10px;
      border: solid $dark-bg;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: $card-bg;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($primary-color, 0.1);

  .selection-info {
    color: rgba($text-color, 0.7);
    font-size: 0.9rem;
  }

  .start-button {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: $dark-bg;
    border: none;
    padding: 10px 25px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(0, 95, 255, 0.3);

    &:hover {
      box-shadow: 0 0 20px rgba(0, 95, 255, 0.5);
      transform: translateY(-1px);
    }

    &:disabled {
      background: rgba($text-color, 0.2);
      color: rgba($text-color, 0.5);
      cursor: not-allowed;
      box-shadow: none;
    }

    .button-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.2);
      opacity: 0;
      border-radius: 6px;
      animation: pulse 2s infinite;
    }
  }
}

.permission-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($dark-bg, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(5px);

  .dialog-content {
    background-color: $card-bg;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    width: 400px;
    border: 1px solid rgba($primary-color, 0.2);
    box-shadow: 0 0 30px rgba(0, 95, 255, 0.3);

    h3 {
      margin-bottom: 10px;
      color: $primary-color;
    }

    p {
      color: rgba($text-color, 0.7);
      margin-bottom: 20px;
    }
  }
}

.tech-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border-radius: 50%;
  background: conic-gradient(
          from 0deg,
          rgba($primary-color, 0) 0%,
          $primary-color 50%,
          rgba($primary-color, 0) 100%
  );
  position: relative;
  animation: spin 1s linear infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 5px;
    background-color: $card-bg;
    border-radius: 50%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style>
