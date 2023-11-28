<script setup lang="ts">
import {provide, ref} from "vue";

  const dropdown_selection = ref(null);

  provide("dropdown_selection",dropdown_selection);

</script>

<template>
  <slot/>
</template>

<style scoped>

</style>