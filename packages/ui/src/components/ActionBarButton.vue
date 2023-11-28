<script setup lang="ts">

</script>

<template>
  <div class="turbomixer-action-bar-button">
    <slot/>
  </div>
</template>

<style scoped>
  .turbomixer-action-bar-button{
    display: inline-block;
    border-radius: 3px;
    line-height: 1.5em;
    width: 1.5em;
    text-align: center;
    margin-left:0.25em;
    margin-right:0.25em;
  }
  .turbomixer-action-bar-button:hover{
    background: rgba(0,0,0,0.1);
  }
</style>