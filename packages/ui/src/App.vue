<script setup lang="ts">
import {ref} from "vue";

const container = ref<HTMLDivElement|null>(null);
defineExpose({
  getContainer(){
    return container?.value;
  }
})
</script>

<template>
  <div class="turbomixer-app" ref="container"></div>
</template>