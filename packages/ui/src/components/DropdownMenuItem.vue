<script setup lang="ts">
  const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="turbomixer-dropdown-menu-item" @click="emits('update:modelValue',null)">
    <slot/>
  </div>
</template>

<style scoped>
  .turbomixer-dropdown-menu-item{
    padding-left: 20px;
  }
  .turbomixer-dropdown-menu-item:hover{
    background: #bbbbff;
  }
</style>