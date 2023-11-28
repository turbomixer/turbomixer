<script setup lang="ts">
import {inject} from "vue";

const model = inject('dropdown_selection')

</script>

<template>
  <div class="turbomixer-dropdown-menu-item" @click="model = null">
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