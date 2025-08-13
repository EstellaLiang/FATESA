<template>
  <div class="permission-audit-container">
    <!-- <div class="header">
      <h1 class="title">权限申请与审计系统</h1>
      <div class="subtitle">军事保密管理系统 | 安全等级: 绝密</div>
    </div> -->

    <div class="content-grid">
      <!-- 权限申请模块 -->
      <div class="card permission-request">
        <div class="card-header">
          <h2><i class="icon icon-request"></i>权限申请</h2>
          <div class="status-badge" :class="{'active': hasPendingRequest}">
            {{ hasPendingRequest ? '待审批' : '无申请' }}
          </div>
        </div>
        <div class="card-body">
          <div v-if="!hasPendingRequest">
            <p class="description">飞行员需要额外权限时需通过军事保密审批流程</p>
            <form @submit.prevent="submitRequest">
              <div class="form-group">
                <label for="permission-type">申请权限类型</label>
                <select id="permission-type" v-model="requestForm.permissionType" required>
                  <option value="">请选择权限类型</option>
                  <option value="data-access">机密数据访问权限</option>
                  <option value="system-admin">系统管理权限</option>
                  <option value="operation-command">作战指挥权限</option>
                  <option value="equipment-control">装备控制权限</option>
                </select>
              </div>
              <div class="form-group">
                <label for="reason">申请理由</label>
                <textarea
                    id="reason"
                    v-model="requestForm.reason"
                    placeholder="详细说明申请该权限的必要性和用途..."
                    required
                ></textarea>
              </div>
              <div class="form-group">
                <label for="duration">申请有效期</label>
                <select id="duration" v-model="requestForm.duration" required>
                  <option value="7">7天</option>
                  <option value="15">15天</option>
                  <option value="30">30天</option>
                  <option value="permanent">永久</option>
                </select>
              </div>
              <button type="submit" class="submit-btn">
                <i class="icon icon-submit"></i>提交申请
              </button>
            </form>
          </div>
          <div v-else class="pending-request">
            <div class="request-info">
              <h3>已提交的申请</h3>
              <p><strong>类型:</strong> {{ pendingRequest.permissionTypeLabel }}</p>
              <p><strong>理由:</strong> {{ pendingRequest.reason }}</p>
              <p><strong>有效期:</strong> {{ pendingRequest.durationLabel }}</p>
              <p><strong>状态:</strong> <span class="status-waiting">审批中</span></p>
              <p><strong>提交时间:</strong> {{ pendingRequest.submitTime }}</p>
            </div>
            <button class="cancel-btn" @click="cancelRequest">
              <i class="icon icon-cancel"></i>撤销申请
            </button>
          </div>
        </div>
      </div>

      <!-- 审批处理模块 (仅军医可见) -->
      <div class="card approval-process" v-if="isMedicalOfficer">
        <div class="card-header">
          <h2><i class="icon icon-approval"></i>待审批请求</h2>
          <div class="status-badge">{{ pendingApprovals.length }} 待处理</div>
        </div>
        <div class="card-body">
          <div v-if="pendingApprovals.length > 0" class="approval-list">
            <div v-for="approval in pendingApprovals" :key="approval.id" class="approval-item">
              <div class="approval-info">
                <h3>{{ approval.requesterName }} - {{ approval.permissionTypeLabel }}</h3>
                <p><strong>部队:</strong> {{ approval.unit }}</p>
                <p><strong>理由:</strong> {{ approval.reason }}</p>
                <p><strong>申请时间:</strong> {{ approval.requestTime }}</p>
              </div>
              <div class="approval-actions">
                <button class="approve-btn" @click="processApproval(approval.id, 'approved')">
                  <i class="icon icon-check"></i>批准
                </button>
                <button class="reject-btn" @click="processApproval(approval.id, 'rejected')">
                  <i class="icon icon-close"></i>拒绝
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-approvals">
            <i class="icon icon-check-circle"></i>
            <p>当前没有待处理的审批请求</p>
          </div>
        </div>
      </div>

      <!-- 安全审计模块 -->
      <div class="card security-audit">
        <div class="card-header">
          <h2><i class="icon icon-audit"></i>安全审计</h2>
          <div class="status-badge">{{ auditLogs.length }} 记录</div>
        </div>
        <div class="card-body">
          <div class="audit-controls">
            <div class="filter-group">
              <label for="security-level">密级筛选</label>
              <select id="security-level" v-model="auditFilter.securityLevel">
                <option value="">全部</option>
                <option value="top-secret">绝密</option>
                <option value="secret">机密</option>
                <option value="confidential">秘密</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="operation-type">操作类型</label>
              <select id="operation-type" v-model="auditFilter.operationType">
                <option value="">全部</option>
                <option value="permission-change">权限变更</option>
                <option value="login">登录</option>
                <option value="data-access">数据访问</option>
                <option value="system-operation">系统操作</option>
              </select>
            </div>
            <button class="refresh-btn" @click="refreshAuditLogs">
              <i class="icon icon-refresh"></i>刷新
            </button>
          </div>
          <div class="audit-log-container">
            <div class="audit-log-header">
              <div class="log-column">时间</div>
              <div class="log-column">操作人员</div>
              <div class="log-column">操作类型</div>
              <div class="log-column">密级</div>
              <div class="log-column">详情</div>
            </div>
            <div class="audit-log-body">
              <div v-for="log in filteredAuditLogs" :key="log.id" class="log-item">
                <div class="log-column">{{ log.time }}</div>
                <div class="log-column">{{ log.operator }}</div>
                <div class="log-column">{{ log.operationTypeLabel }}</div>
                <div class="log-column" :class="`level-${log.securityLevel}`">
                  {{ log.securityLevelLabel }}
                </div>
                <div class="log-column details">{{ log.details }}</div>
              </div>
            </div>
          </div>
          <div class="audit-footer">
            <div class="report-info">
              每月1号系统会自动生成权限安全报告，并同步报送至上级保卫部门
            </div>
            <button class="generate-report-btn" @click="generateReport">
              <i class="icon icon-report"></i>生成安全报告
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

// 权限申请表单
interface PermissionRequest {
  permissionType: string
  reason: string
  duration: string
}

// 审批请求
interface ApprovalRequest {
  id: string
  requesterName: string
  unit: string
  permissionType: string
  permissionTypeLabel: string
  reason: string
  requestTime: string
}

// 审计日志
interface AuditLog {
  id: string
  time: string
  operator: string
  operationType: string
  operationTypeLabel: string
  securityLevel: string
  securityLevelLabel: string
  details: string
}

// 用户角色
const userRole = ref<'pilot' | 'medical-officer' | 'admin'>('pilot')
const isMedicalOfficer = computed(() => userRole.value === 'medical-officer')

// 权限申请状态
const hasPendingRequest = ref(false)
const requestForm = ref<PermissionRequest>({
  permissionType: '',
  reason: '',
  duration: '7'
})

const pendingRequest = ref({
  permissionType: 'data-access',
  permissionTypeLabel: '机密数据访问权限',
  reason: '需要访问作战计划数据以完成飞行任务准备',
  duration: '15',
  durationLabel: '15天',
  submitTime: '2023-06-15 14:30:22'
})

// 待审批请求
const pendingApprovals = ref<ApprovalRequest[]>([
  {
    id: 'req-001',
    requesterName: '张伟',
    unit: '空军第3师7团',
    permissionType: 'data-access',
    permissionTypeLabel: '机密数据访问权限',
    reason: '需要查看最新的雷达数据以完成训练任务',
    requestTime: '2023-06-15 09:12:45'
  },
  {
    id: 'req-002',
    requesterName: '李强',
    unit: '空军第5师2团',
    permissionType: 'equipment-control',
    permissionTypeLabel: '装备控制权限',
    reason: '需要临时控制无人机系统进行测试',
    requestTime: '2023-06-14 16:45:33'
  }
])

// 审计日志
const auditFilter = ref({
  securityLevel: '',
  operationType: ''
})

const auditLogs = ref<AuditLog[]>([
  {
    id: 'log-001',
    time: '2023-06-15 10:22:15',
    operator: 'admin01',
    operationType: 'permission-change',
    operationTypeLabel: '权限变更',
    securityLevel: 'top-secret',
    securityLevelLabel: '绝密',
    details: '授予用户 pilot03 机密数据访问权限'
  },
  {
    id: 'log-002',
    time: '2023-06-15 09:45:30',
    operator: 'medical01',
    operationType: 'permission-change',
    operationTypeLabel: '权限变更',
    securityLevel: 'secret',
    securityLevelLabel: '机密',
    details: '拒绝用户 pilot05 的装备控制权限申请'
  },
  {
    id: 'log-003',
    time: '2023-06-15 08:12:05',
    operator: 'pilot02',
    operationType: 'data-access',
    operationTypeLabel: '数据访问',
    securityLevel: 'confidential',
    securityLevelLabel: '秘密',
    details: '访问作战任务数据'
  },
  {
    id: 'log-004',
    time: '2023-06-14 22:30:18',
    operator: 'system',
    operationType: 'system-operation',
    operationTypeLabel: '系统操作',
    securityLevel: 'top-secret',
    securityLevelLabel: '绝密',
    details: '自动生成月度安全报告'
  }
])

// 计算过滤后的审计日志
const filteredAuditLogs = computed(() => {
  return auditLogs.value.filter(log => {
    const securityMatch = !auditFilter.value.securityLevel ||
        log.securityLevel === auditFilter.value.securityLevel
    const operationMatch = !auditFilter.value.operationType ||
        log.operationType === auditFilter.value.operationType
    return securityMatch && operationMatch
  })
})

// 提交权限申请
const submitRequest = () => {
  // 实际应用中这里会调用API提交申请
  console.log('提交权限申请:', requestForm.value)
  hasPendingRequest.value = true

  // 模拟设置待审批请求
  pendingRequest.value = {
    permissionType: requestForm.value.permissionType,
    permissionTypeLabel: getPermissionTypeLabel(requestForm.value.permissionType),
    reason: requestForm.value.reason,
    duration: requestForm.value.duration,
    durationLabel: requestForm.value.duration === 'permanent' ? '永久' : `${requestForm.value.duration}天`,
    submitTime: new Date().toLocaleString()
  }

  // 重置表单
  requestForm.value = {
    permissionType: '',
    reason: '',
    duration: '7'
  }
}

// 撤销申请
const cancelRequest = () => {
  // 实际应用中这里会调用API撤销申请
  console.log('撤销权限申请')
  hasPendingRequest.value = false
}

// 处理审批
const processApproval = (requestId: string, decision: 'approved' | 'rejected') => {
  // 实际应用中这里会调用API处理审批
  console.log(`处理审批 ${requestId}: ${decision}`)

  // 从待审批列表中移除
  pendingApprovals.value = pendingApprovals.value.filter(req => req.id !== requestId)

  // 添加到审计日志
  const request = pendingApprovals.value.find(req => req.id === requestId)
  if (request) {
    auditLogs.value.unshift({
      id: `log-${Date.now()}`,
      time: new Date().toLocaleString(),
      operator: 'medical01', // 当前用户
      operationType: 'permission-change',
      operationTypeLabel: '权限变更',
      securityLevel: 'secret',
      securityLevelLabel: '机密',
      details: `${decision === 'approved' ? '批准' : '拒绝'} ${request.requesterName} 的${request.permissionTypeLabel}申请`
    })
  }
}

// 刷新审计日志
const refreshAuditLogs = () => {
  // 实际应用中这里会调用API获取最新日志
  console.log('刷新审计日志')
}

// 生成安全报告
const generateReport = () => {
  // 实际应用中这里会调用API生成报告
  console.log('生成安全报告')
  alert('安全报告已生成并报送至上级保卫部门')
}

// 辅助函数：获取权限类型标签
const getPermissionTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'data-access': '机密数据访问权限',
    'system-admin': '系统管理权限',
    'operation-command': '作战指挥权限',
    'equipment-control': '装备控制权限'
  }
  return types[type] || type
}

// 初始化
onMounted(() => {
  // 模拟根据用户角色设置
  // userRole.value = 'medical-officer'
})
</script>

<style lang="scss" scoped>
$primary-color: #00f2fe; // 科技蓝
$secondary-color: #4facfe; // 渐变蓝
$accent-color: #00ff9d; // 霓虹绿
$danger-color: #ff416c; // 警示红
$warning-color: #ffc107; // 警告黄
$text-color: rgba(255, 255, 255, 0.85); // 主文字
$text-secondary: rgba(255, 255, 255, 0.6); // 次要文字
$bg-color: #0a1a2a; // 深蓝背景
$card-bg: rgba(16, 42, 67, 0.6); // 卡片背景
$border-color: rgba(0, 242, 254, 0.3); // 边框颜色

.permission-audit-container {
  padding: 20px;
  background: linear-gradient(135deg, #0a1a2a 0%, #0a2a3a 100%);
  color: $text-color;
  font-family: 'Arial', sans-serif;
  height: calc(100vh - $title-height-small);

  .header {
    text-align: center;
    margin-bottom: 30px;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, transparent, $primary-color, transparent);
      margin: 15px auto;
    }

    .title {
      font-size: 28px;
      margin: 0;
      background: linear-gradient(90deg, $primary-color, $accent-color);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba($primary-color, 0.3);
    }

    .subtitle {
      font-size: 14px;
      color: $text-secondary;
      letter-spacing: 1px;
    }
  }

  .content-grid {
    display: flex;
    gap: 20px;
  }

  .card {
    flex: 1;
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba($primary-color, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 0 20px rgba($primary-color, 0.2);
      transform: translateY(-2px);
    }

    .card-header {
      padding: 15px 20px;
      border-bottom: 1px solid $border-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);

      h2 {
        margin: 0;
        font-size: 18px;
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          color: $primary-color;
        }
      }

      .status-badge {
        background: rgba($primary-color, 0.1);
        color: $primary-color;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        border: 1px solid $primary-color;

        &.active {
          background: rgba($warning-color, 0.1);
          color: $warning-color;
          border-color: $warning-color;
        }
      }
    }

    .card-body {
      padding: 20px;

      .description {
        color: $text-secondary;
        margin-bottom: 20px;
        line-height: 1.5;
      }
    }
  }

  // 权限申请表单样式
  .permission-request {
    .form-group {
      margin-bottom: 15px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: $text-secondary;
      }

      select, textarea {
        width: 100%;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid $border-color;
        border-radius: 4px;
        color: $text-color;
        font-family: inherit;
        transition: all 0.3s;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
        }
      }

      textarea {
        min-height: 100px;
        resize: vertical;
      }
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(90deg, $primary-color, $secondary-color);
      border: none;
      border-radius: 4px;
      color: #000;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      .icon {
        margin-right: 8px;
      }

      &:hover {
        background: linear-gradient(90deg, lighten($primary-color, 5%), lighten($secondary-color, 5%));
        box-shadow: 0 0 10px rgba($primary-color, 0.5);
      }
    }

    .pending-request {
      .request-info {
        margin-bottom: 20px;

        h3 {
          margin-top: 0;
          color: $primary-color;
        }

        p {
          margin: 8px 0;
          line-height: 1.4;

          strong {
            color: $text-secondary;
            margin-right: 5px;
          }

          .status-waiting {
            color: $warning-color;
          }
        }
      }

      .cancel-btn {
        width: 100%;
        padding: 10px;
        background: rgba($danger-color, 0.1);
        border: 1px solid $danger-color;
        border-radius: 4px;
        color: $danger-color;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        .icon {
          margin-right: 8px;
        }

        &:hover {
          background: rgba($danger-color, 0.2);
          box-shadow: 0 0 10px rgba($danger-color, 0.3);
        }
      }
    }
  }

  // 审批处理样式
  .approval-process {
    .approval-list {
      .approval-item {
        padding: 15px;
        margin-bottom: 15px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid $border-color;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .approval-info {
          margin-bottom: 15px;

          h3 {
            margin: 0 0 10px 0;
            color: $primary-color;
            font-size: 16px;
          }

          p {
            margin: 5px 0;
            font-size: 14px;
            color: $text-secondary;
          }
        }

        .approval-actions {
          display: flex;
          gap: 10px;

          button {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;

            .icon {
              margin-right: 5px;
            }
          }

          .approve-btn {
            background: rgba($accent-color, 0.1);
            border: 1px solid $accent-color;
            color: $accent-color;

            &:hover {
              background: rgba($accent-color, 0.2);
              box-shadow: 0 0 10px rgba($accent-color, 0.3);
            }
          }

          .reject-btn {
            background: rgba($danger-color, 0.1);
            border: 1px solid $danger-color;
            color: $danger-color;

            &:hover {
              background: rgba($danger-color, 0.2);
              box-shadow: 0 0 10px rgba($danger-color, 0.3);
            }
          }
        }
      }
    }

    .no-approvals {
      text-align: center;
      padding: 30px 0;
      color: $text-secondary;

      .icon {
        font-size: 40px;
        color: $accent-color;
        margin-bottom: 15px;
      }

      p {
        margin: 0;
      }
    }
  }

  // 安全审计样式
  .security-audit {
    grid-column: 1 / -1;

    .audit-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;

      .filter-group {
        flex: 1;
        min-width: 200px;

        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: $text-secondary;
        }

        select {
          width: 100%;
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid $border-color;
          border-radius: 4px;
          color: $text-color;
          font-family: inherit;
        }
      }

      .refresh-btn {
        align-self: flex-end;
        padding: 8px 15px;
        background: rgba($primary-color, 0.1);
        border: 1px solid $primary-color;
        border-radius: 4px;
        color: $primary-color;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.3s;

        .icon {
          margin-right: 5px;
        }

        &:hover {
          background: rgba($primary-color, 0.2);
          box-shadow: 0 0 10px rgba($primary-color, 0.3);
        }
      }
    }

    .audit-log-container {
      border: 1px solid $border-color;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;

      .audit-log-header {
        display: grid;
        grid-template-columns: 150px 120px 120px 100px 1fr;
        background: rgba(0, 0, 0, 0.3);
        padding: 10px 15px;
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid $border-color;
      }

      .audit-log-body {
        max-height: 300px;
        overflow-y: auto;

        .log-item {
          display: grid;
          grid-template-columns: 150px 120px 120px 100px 1fr;
          padding: 10px 15px;
          font-size: 13px;
          border-bottom: 1px solid rgba($border-color, 0.2);

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: rgba($primary-color, 0.05);
          }

          .log-column {
            padding: 2px 0;
            display: flex;
            align-items: center;

            &.details {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            &.level-top-secret {
              color: $danger-color;
            }

            &.level-secret {
              color: $warning-color;
            }

            &.level-confidential {
              color: $accent-color;
            }
          }
        }
      }
    }

    .audit-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid $border-color;

      .report-info {
        font-size: 13px;
        color: $text-secondary;
        flex: 1;
      }

      .generate-report-btn {
        padding: 8px 15px;
        background: linear-gradient(90deg, $accent-color, darken($accent-color, 10%));
        border: none;
        border-radius: 4px;
        color: #000;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.3s;

        .icon {
          margin-right: 5px;
        }

        &:hover {
          background: linear-gradient(90deg, lighten($accent-color, 5%), $accent-color);
          box-shadow: 0 0 10px rgba($accent-color, 0.5);
        }
      }
    }
  }

  // 图标样式 (实际项目中应使用图标字体或SVG)
  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    vertical-align: middle;

    &.icon-request {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f2fe'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
    }

    &.icon-submit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
    }

    &.icon-cancel {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff416c'%3E%3Cpath d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'/%3E%3C/svg%3E");
    }

    &.icon-approval {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f2fe'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E");
    }

    &.icon-check {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300ff9d'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
    }

    &.icon-close {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff416c'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
    }

    &.icon-check-circle {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300ff9d'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
    }

    &.icon-audit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f2fe'%3E%3Cpath d='M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z'/%3E%3C/svg%3E");
    }

    &.icon-refresh {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f2fe'%3E%3Cpath d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E");
    }

    &.icon-report {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z'/%3E%3C/svg%3E");
    }
  }
}
</style>
