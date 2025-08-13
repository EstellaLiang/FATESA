<template>
  <!--  <section class="app-main" :style="{ minHeight: minHeight }">-->
  <section class="app-main">
    <router-view>
      <template #default="{ Component, route }">
        <transition
            enter-active-class="animate__animated animate__fadeIn"
            mode="out-in"
        >
          <keep-alive>
            <component :is="Component" :key="route.path"/>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </section>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  box-sizing: border-box;
  height: calc(100vh - $title-height-small - 10px);
}

@media (min-width: 1680px) {
  .app-main {
    height: calc(100vh - $title-height-big - 10px);
  }
}
</style>
