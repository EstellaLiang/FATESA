<script setup lang="ts">
import NavItem from "@/layout/components/NavBar/component/NavItem.vue";
import {type Menu, useUserStore} from "@/store";

const userStore = useUserStore();

// 从 localStorage 中获取保存的当前 menu 信息，若没有则使用默认值
const currentMenu = ref<Menu>(JSON.parse(localStorage.getItem('currentMenu') || JSON.stringify(userStore.menus[0])));
const showLeftNavBar = ref<boolean>(false);

// 定义自定义事件
const emit = defineEmits(['menu-click']);

// 定义一个方法用于更新当前 menu
const handleMenuClick = (menu: Menu) => {
  currentMenu.value = menu;
  showLeftNavBar.value = !!menu.hasChildMenu;
  console.log(currentMenu.value, showLeftNavBar.value)
  // 保存当前 menu 信息到 localStorage
  localStorage.setItem('currentMenu', JSON.stringify(menu));
  emit('menu-click', menu);
};

// 组件挂载时检查 userStore.menus 是否有更新
onMounted(() => {
  if (!userStore.menus.some(m => m.path === currentMenu.value.path)) {
    currentMenu.value = userStore.menus[0];
    showLeftNavBar.value = !!currentMenu.value.hasChildMenu;
    localStorage.setItem('currentMenu', JSON.stringify(currentMenu.value));
  }
});
</script>

<template>
  <div class="nav-container">
    <NavItem
        class="nav-item"
        v-for="menu in userStore.menus"
        :item="menu"
        :key="menu.path"
        @click="handleMenuClick(menu)"/>
  </div>
  <LeftNavBar v-if="showLeftNavBar" :item="currentMenu"/>
</template>

<style scoped lang="scss">
.nav-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: $title-height-small;
}

.nav-item {
  background-size: 100% 90%;
  background-repeat: no-repeat;
  background-position: center;
  height: 40px;
  width: 150px;
}

.nav-item:nth-child(3) {
  margin-right: 500px;
}

.nav-item:nth-last-child(-n+3) {
  background-image: url("@/assets/img/nav-bg-right.png");
}

.nav-item:nth-child(-n+3) {
  background-image: url("@/assets/img/nav-bg-left.png");
}

@media (min-width: 1680px) {
  .nav-item {
    height: 55px;
    width: 180px;
    font-size: 16px;
  }

  .nav-item:nth-child(3) {
    margin-right: 700px;
  }
}
</style>
