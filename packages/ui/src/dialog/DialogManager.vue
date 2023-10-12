<script setup lang="ts">
  import {computed} from "vue";
  import ProjectNew from "./project/ProjectNew.vue";

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
    <ProjectNew v-model="model.project.new"></ProjectNew>
</template>

<style scoped>

</style>