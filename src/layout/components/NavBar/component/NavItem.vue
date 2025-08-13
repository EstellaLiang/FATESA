<script setup lang="ts">
import {Menu} from '@/store/modules/user';

const props = defineProps<{
  item: Menu;
}>();
</script>

<template>
  <router-link
      class="nav-item-container"
      :key="props.item.path"
      :to="props.item.path"
  >
    {{ props.item.title }}
  </router-link>
</template>

<style scoped lang="scss">
.nav-item-container {
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
