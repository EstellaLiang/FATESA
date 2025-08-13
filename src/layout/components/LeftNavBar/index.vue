<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
// 初始化 currentMenu
const currentMenu = ref(props.item.children && props.item.children.length > 0 ? props.item.children[0] : null);

const switchMenu = (item: object) => {
  currentMenu.value = item;
}

// 监听 props.item.children 的变化
watch(() => props.item.children, (newChildren) => {
  if (newChildren && newChildren.length > 0) {
    currentMenu.value = newChildren[0];
  } else {
    currentMenu.value = null;
  }
}, {deep: true});
</script>

<template>
  <div class="left-nav-bar">
    <div class="nav-bar-title">{{ props.item.title }}</div>
    <div class="category-list">
      <router-link
          v-for="child in props.item.children"
          class="category-item"
          :class="{ active: currentMenu.path === child.path }"
          :to="child.path"
          @click="switchMenu(child)"
      >
        {{ child.title }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.left-nav-bar {
  width: $left-nav-bar-width;
  height: calc(100vh - $title-height-big);
  background-color: rgba(0, 21, 41, 0.4);
  border-right: 1px solid rgba(77, 179, 255, 0.3);
  display: flex;
  flex-direction: column;

  .nav-bar-title {
    padding: 15px;
    font-size: 16px;
    font-weight: bold;
    color: #4db3ff;
    border-bottom: 1px solid rgba(77, 179, 255, 0.3);
    background: linear-gradient(90deg, rgba(10, 73, 134, 0.4), rgba(10, 73, 134, 0.2));
    text-align: center;
  }

  div[style*="padding: 10px 15px;"] {
    border-bottom: 1px solid rgba(77, 179, 255, 0.2);
  }

  .category-list .category-item {
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-left: 3px solid transparent;
    border-bottom: 1px solid rgba(77, 179, 255, 0.2);
    color: #ffffff;
  }

  .category-list .category-item:hover {
    background-color: rgba(77, 179, 255, 0.1);
  }

  .category-list .category-item.active {
    background-color: rgba(77, 179, 255, 0.2);
    border-left: 3px solid #4db3ff;
    color: #66caff;
  }
}
</style>
