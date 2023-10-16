<script setup lang="ts">
  import {computed} from "vue";

  const props = defineProps(['title','id','modelValue'])
  const emit = defineEmits(['update:modelValue']);
  const model = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit('update:modelValue', value)
    }
  })
</script>

<template>
  <div class="turbomixer-dropdown" :class="model == props.id ? ['turbomixer-dropdown-activate'] : []">
    <div class="turbomixer-dropdown-button" @click="model = model == props.id ? null : props.id" @mousemove="model = model == null ? null : props.id">
      {{props.title}}
    </div>
    <div class="turbomixer-dropdown-main" :style="{display:model == props.id ? 'block' : 'none'}">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
.turbomixer-dropdown{
  display: inline-block;
  position: relative;
  height: 30px;
  user-select: none;
  -webkit-user-select: none;
  z-index: 10;
}
.turbomixer-dropdown-button{
  padding-left:10px;
  padding-right: 10px;
}
.turbomixer-dropdown-main{
  position: absolute;
  background: #f8f8f8;
  min-width: 200px;
  border: 1px solid rgb(200, 200, 200);
  left: 0;
  z-index: 10;
}
.turbomixer-dropdown-activate{
  background-color:#bbbbff;
}
</style>