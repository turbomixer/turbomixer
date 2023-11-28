<script setup lang="ts">
  import {computed} from "vue";
  import ProjectNew from "./project/ProjectNew.vue";
  import ProjectOpen from "./project/ProjectOpen.vue";

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
  <ProjectNew v-model="model.project.new" v-if="model.project.new"></ProjectNew>
  <ProjectOpen v-model="model.project.open" v-if="model.project.open"></ProjectOpen>
</template>

<style scoped>

</style>