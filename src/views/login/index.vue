<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {User, Lock, Message, Key, Avatar} from '@element-plus/icons-vue';
import AuthAPI from "@/api/auth";
import {TOKEN} from "@/enums/CacheEnum";
import router from "@/router";
import {useUserStore} from "@/store";

// 定义表单数据
const loginForm = ref({
  username: '',
  password: '',
  role: 'pilot', // 默认角色为飞行员
  verificationCode: ''
});

// 定义表单验证错误信息
const errorMessages = ref({
  username: '',
  password: '',
  verificationCode: ''
});

// 定义打字机效果相关变量
const titleText = ref('');
const fullText = '欢迎使用飞行员疲劳状态智能评估数字孪生平台';
let index = 0;

// 定义密码显示状态
const showPassword = ref(false);
const showVerificationCode = ref(false);
const isFirstLogin = ref(false); // 模拟首次登录或异地登录
const showSCVerification = ref(false); // 显示安全卡验证
const countdown = ref(0); // 验证码倒计时

// 角色选项
const roleOptions = [
  {value: 'pilot', label: '飞行员'},
  {value: 'doctor', label: '航医'},
  {value: 'admin', label: '管理员'}
];

// 组件挂载时开始打字机效果
onMounted(() => {
  typeWriter();
  // 模拟检测异地登录
  if (Math.random() > 0.7) {
    isFirstLogin.value = true;
  }
});

// 打字机函数
const typeWriter = () => {
  if (index < fullText.length) {
    titleText.value += fullText.charAt(index);
    index++;
    setTimeout(typeWriter, 150);
  }
};

// 表单验证函数
const validateForm = () => {
  let isValid = true;

  if (!loginForm.value.username.trim()) {
    errorMessages.value.username = '请输入用户名/工号';
    isValid = false;
  } else {
    errorMessages.value.username = '';
  }

  if (!loginForm.value.password.trim()) {
    errorMessages.value.password = '请输入密码';
    isValid = false;
  } else {
    errorMessages.value.password = '';
  }

  // if (isFirstLogin.value && !loginForm.value.verificationCode.trim()) {
  //   errorMessages.value.verificationCode = '请输入验证码';
  //   isValid = false;
  // } else {
  //   errorMessages.value.verificationCode = '';
  // }

  return isValid;
};

// 获取用户 Store 实例
const userStore = useUserStore();

// 发送验证码
const sendVerificationCode = () => {
  // 这里应该是调用API发送验证码
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 切换安全卡验证方式
const useSCCard = () => {
  showSCVerification.value = true;
};

// 定义登录方法
const handleSubmit = async () => {
  if (validateForm()) {
    await userStore.handleLogin(loginForm.value);
  }
};
</script>

<template>
  <div class="login-container">
    <div class="content-container">
      <h1 class="typing-title">{{ titleText }}</h1>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="login-title">航空安全认证系统</div>

        <!-- 角色选择 -->
        <div class="form-item">
          <label>
            <Avatar class="label-icon"/>
            身份角色
          </label>
          <div class="role-options">
            <label v-for="option in roleOptions" :key="option.value">
              <input
                  type="radio"
                  v-model="loginForm.role"
                  :value="option.value"
              >
              <span class="label-text">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- 用户名输入 -->
        <div class="form-item">
          <label for="username">
            <User class="label-icon"/>
            用户名/工号
          </label>
          <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入工号或注册邮箱"
          />
          <span class="error-message">{{ errorMessages.username }}</span>
        </div>

        <!-- 密码输入 -->
        <div class="form-item">
          <label for="password">
            <Lock class="label-icon"/>
            密码
          </label>
          <div class="password-input">
            <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
            />
            <button type="button" @click="showPassword = !showPassword" class="password-toggle">
              <img v-if="showPassword" src="@/assets/img/eye-close.png" alt="">
              <img v-else src="@/assets/img/eye.png" alt="">
            </button>
          </div>
          <span class="error-message">{{ errorMessages.password }}</span>
        </div>

        <!-- 首次登录/异地登录验证 -->
        <div v-if="isFirstLogin" class="multi-factor-auth">
          <div class="auth-method-tabs">
            <button
                type="button"
                :class="{active: !showSCVerification}"
                @click="showSCVerification = false"
            >
              <Message class="icon"/>
              短信验证
            </button>
            <button
                type="button"
                :class="{active: showSCVerification}"
                @click="useSCCard"
            >
              <Key class="icon"/>
              安全卡验证
            </button>
          </div>

          <!-- 短信验证码 -->
          <div v-if="!showSCVerification" class="form-item">
            <label for="verificationCode">
              验证码
            </label>
            <div class="verification-code-input">
              <input
                  id="verificationCode"
                  v-model="loginForm.verificationCode"
                  :type="showVerificationCode ? 'text' : 'password'"
                  placeholder="请输入6位验证码，默认为123456"
              />
              <button
                  type="button"
                  @click="sendVerificationCode"
                  class="send-code-btn"
                  :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </button>
            </div>
            <span class="error-message">{{ errorMessages.verificationCode }}</span>
          </div>

          <!-- 安全卡验证 -->
          <div v-if="showSCVerification" class="sc-card-verification">
            <p>请插入您的航空安全智能卡(SC)</p>
            <div class="sc-card-slot">
              <Key class="sc-card-icon"/>
              <p>正在验证安全卡...</p>
            </div>
          </div>
        </div>

        <div class="form-item">
          <button type="submit" class="login-button">登 录</button>
        </div>

        <div class="form-footer">
          <a href="https://fatigue-monitoring.aviation.com/forgot-password">忘记密码?</a>
          <span>推荐使用 Chrome/Firefox 浏览器</span>
        </div>
      </form>

      <div class="copyright">
        &copy; 2025 中国空军医学特色中心 版权所有
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  background-image: url('@/assets/img/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.content-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px 0;
  z-index: 2;
}

.typing-title {
  margin-bottom: 30px;
  font-size: clamp(2rem, 4vw, 4rem);
  background: linear-gradient(45deg, #3C75FE, #EBFFFF, #3C75FE);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  z-index: 2;
  line-height: 1.2;
}

.login-form {
  color: #222222;
  width: 450px;
  max-width: 90vw;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  z-index: 2;
  min-height: 400px;
  max-height: 75vh;
  overflow-y: auto;
  box-sizing: border-box;
  transition: all 0.3s ease;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(26, 62, 140, 0.6);
    border-radius: 4px;
    transition: background 0.3s ease;
    
    &:hover {
      background: rgba(26, 62, 140, 0.8);
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #1a3e8c;
}

.role-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;

    input {
      width: 20px;
      margin-right: 5px;
    }

    span {
      padding: 5px 10px;
      border-radius: 4px;
      transition: all 0.3s;
      border: 1px solid #1a3e8c;
      background-color: #E8F0FE;
    }

    input:checked + span {
      background-color: #1a3e8c;
      color: white;
    }
  }
}

.form-item {
  margin: 15px 0;
  transition: margin 0.3s ease;

  label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    word-wrap: break-word;

    .label-icon {
      width: 16px;
      color: #1a3e8c;
      margin-right: 8px;
      flex-shrink: 0;
    }
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border 0.3s;
    box-sizing: border-box;

    &:focus {
      border-color: #1a3e8c;
      outline: none;
    }
  }
}

.password-input, .verification-code-input {
  position: relative;

  button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    img {
      width: 20px;
      height: 20px;
    }
  }
}

.verification-code-input {
  display: flex;
  gap: 0;

  input {
    flex: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    min-width: 0; /* 防止flex子项溢出 */
  }

  .send-code-btn {
    position: static;
    transform: none;
    width: 120px;
    padding: 0 10px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-left: none;
    border-radius: 0 4px 4px 0;
    color: #1a3e8c;
    font-size: 12px;
    white-space: nowrap;
    flex-shrink: 0; /* 防止按钮被压缩 */

    &:disabled {
      color: #999;
      cursor: not-allowed;
    }
  }
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  display: block;
  margin-top: 5px;
  height: 18px;
}

.multi-factor-auth {
  margin: 15px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #eee;
}

.auth-method-tabs {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;

  button {
    flex: 1;
    padding: 8px 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    .icon {
      margin-right: 5px;
      width: 14px;
      height: 14px;
    }

    &.active {
      color: #1a3e8c;
      border-bottom-color: #1a3e8c;
      font-weight: 500;
    }
  }
}

.sc-card-verification {
  text-align: center;
  padding: 15px 0;

  p {
    margin: 10px 0;
    color: #555;
    word-wrap: break-word;
  }
}

.sc-card-slot {
  margin: 20px auto;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  max-width: 200px;
  word-wrap: break-word;

  .sc-card-icon {
    width: 40px;
    height: 40px;
    color: #1a3e8c;
    margin-bottom: 10px;
  }
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #1a3e8c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #0d2b66;
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 12px;
  color: #666;

  a {
    color: #1a3e8c;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.copyright {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 420px;
    padding: 20px;
    min-height: 350px;
    
    /* 移动端滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(26, 62, 140, 0.5);
    }
  }

  .typing-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin-bottom: 20px;
  }

  .content-container {
    padding: 10px 0;
  }

  .multi-factor-auth {
    margin: 10px 0;
    padding: 12px;
  }

  .auth-method-tabs button {
    font-size: 12px;
    padding: 6px 0;
  }

  .form-item {
    margin: 12px 0;
  }

  .role-options {
    flex-direction: column;
    gap: 8px;
    
    label {
      justify-content: flex-start;
    }
  }
}

@media (max-width: 480px) {
  .login-form {
    width: 95%;
    padding: 15px;
    min-height: 320px;
    
    /* 小屏幕滚动条样式 */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(26, 62, 140, 0.4);
    }
  }

  .typing-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  .login-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .form-item input {
    padding: 8px 10px;
    font-size: 13px;
  }

  .verification-code-input {
    flex-direction: column;
    gap: 8px;
    
    input {
      border-radius: 4px;
      border-right: 1px solid #ddd;
    }
    
    .send-code-btn {
      width: 100%;
      border-radius: 4px;
      border: 1px solid #ddd;
      padding: 8px 10px;
      font-size: 12px;
    }
  }

  .form-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .role-options {
    flex-direction: column;
    gap: 8px;
    
    label {
      justify-content: flex-start;
      width: 100%;
    }
  }

  .auth-method-tabs {
    flex-direction: column;
    gap: 5px;
    
    button {
      border-bottom: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 5px;
      
      &.active {
        border-color: #1a3e8c;
        background-color: #1a3e8c;
        color: white;
      }
    }
  }
}

@media (max-width: 360px) {
  .login-form {
    width: 98%;
    padding: 12px;
    min-height: 300px;
    
    /* 超小屏幕滚动条样式 */
    &::-webkit-scrollbar {
      width: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(26, 62, 140, 0.3);
    }
  }

  .typing-title {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .login-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .form-item {
    margin: 8px 0;
  }

  .form-item input {
    padding: 6px 8px;
    font-size: 12px;
  }

  .multi-factor-auth {
    margin: 8px 0;
    padding: 10px;
  }

  .sc-card-slot {
    padding: 15px;
    max-width: 180px;
  }
}

@media (max-height: 700px) {
  .content-container {
    padding: 10px 0;
  }

  .typing-title {
    margin-bottom: 20px;
  }

  .login-form {
    min-height: 300px;
    max-height: 85vh;
  }

  .form-item {
    margin: 10px 0;
  }

  .multi-factor-auth {
    margin: 10px 0;
    padding: 12px;
  }
}
</style>
