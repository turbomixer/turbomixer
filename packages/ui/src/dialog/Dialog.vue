<script setup lang="ts">
  const props = defineProps(['mask','modelValue','closable']);
  const emits = defineEmits(['update:modelValue']);
  function autoClose(){
    if(props.closable){
      emits('update:modelValue',false);
    }
  }
</script>

<template>
  <div class="turbomixer-dialog" v-if="props.modelValue">
    <div class="turbomixer-dialog-mask" v-if="props.mask" @click="autoClose"></div>
    <div class="turbomixer-dialog-entity">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
  .turbomixer-dialog{
    z-index: 256;
    position: absolute;
    left: 0;
    top:0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .turbomixer-dialog-mask{
    position: absolute;
    left: 0;
    top:0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    background: rgba(0,0,0,0.2);
  }
  .turbomixer-dialog-entity{
    position: absolute;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
    pointer-events: auto;
  }
</style>