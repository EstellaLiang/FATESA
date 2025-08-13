<script setup lang="ts">
import {type Menu, useUserStore} from "@/store";
import {ArrowDown, UserFilled} from "@element-plus/icons-vue";

const userStore = useUserStore();
const router = useRouter();

// 退出登录方法
const handleLogout = () => {
  try {
    // 调用 store 中的退出登录方法
    userStore.logout();
    // 跳转到登录页面
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// 从 localStorage 中获取是否混合导航布局信息，若没有则使用默认值
const isMixNavLayout = ref<boolean>(userStore.menus.find(menu => menu.path === router.currentRoute.value.path)?.hasChildMenu || false);

// 处理接收到的路由信息
const onMenuClick = (menu: Menu) => {
  isMixNavLayout.value = !!menu.hasChildMenu;
};

const handleCommand = (command: string | number | object) => {
  if (command === 'logout') {
    handleLogout();
  }
}
</script>

<template>
  <div class="app-container">
    <div class="top">
      <div class="title"><span class="text">实时视线追踪与疲劳预警系统</span></div>
      <div class="info">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-icon class="user-icon">
              <UserFilled/>
            </el-icon>
            <span class="user-username">{{ userStore.userInfo?.username }}</span>
            <el-icon color="#8edcf1">
              <ArrowDown/>
            </el-icon>
          </div>
          <template #dropdown>
            <div class="role-info">{{ userStore.userInfo?.roles[0] }}</div>
            <el-dropdown-menu>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <NavBar @menu-click="onMenuClick"/>
    </div>
    <AppMain :class="{'is-mix-nav-layout': isMixNavLayout}"/>

  </div>
</template>

<style scoped lang="scss">
.app-container {
  background-image: url("@/assets/img/layout.png");
  height: 100vh;
  width: 100vw;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  background-color: #000C1A;

  .top {
    height: $title-height-small;
  }
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .text {
    position: absolute;
    top: 0;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 4px;
    color: #8edcf1;
    text-shadow: 3px 3px 6px rgba(0, 0, 128, 0.7), -1px -1px 2px rgba(74, 144, 226, 0.3);
  }
}

.app-main.is-mix-nav-layout {
  margin-left: $left-nav-bar-width;
}

.info {
  position: absolute;
  right: 2px; // 增加右侧间距
  height: $title-height-small;
}

.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
  padding: 5px 10px;
  gap: 8px; // 增加元素间间距
  border-radius: 4px; // 添加圆角
  transition: background-color 0.3s ease; // 添加过渡效果

  &:hover {
    background-color: rgba(255, 255, 255, 0.1); // 悬停背景色
  }

  .user-icon {
    display: none;
    font-size: 18px; // 增大图标大小
    color: #42d2ec; // 图标颜色
  }

  .user-username {
    font-size: 14px; // 文字大小
    color: #ffffff; // 文字颜色
    margin: 0; // 移除原有边距
  }

  .user-role {
    font-weight: bold; // 角色名称加粗
  }
}

.role-info {
  display: flex;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  color: #7c828d;
}

// 大屏适配
@media (min-width: 1680px) {
  .title .text {
    font-size: 32px;
  }

  .app-container .top {
    height: $title-height-big;
  }

  .info {
    margin-right: 10px;
  }

  .user-info {
    margin: 15px 0;

    .user-icon {
      display: block;
    }
  }
}
</style>
