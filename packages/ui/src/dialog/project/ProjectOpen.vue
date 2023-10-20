<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import Dialog from "../Dialog.vue";
import {inject} from "vue";
import {Context} from "@turbomixer/core";

const ctx = inject<Context>('ctx');

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

const projects = ref<any[]>([])

onMounted(()=>{
  ctx?.using(['project'],async (ctx:Context)=>{
    console.info("Project OK")
    projects.value = await ctx.project.list();
  })
})
</script>

<template>
  <Dialog v-model="model" :closable="true" :mask="true">
    <div style="width: 40em;min-height: 20em;background: white;border: 1px solid #cccccc;padding-bottom: 0.5em;display: flex;flex-direction: column">
      <div style="width: 100%;height: 2em;line-height: 2em;background: #eeeeee">
        <span style="padding-left: 1em">
          打开一个TurboMixer项目
        </span>
      </div>
      <div style="display: flex;flex-direction: column;flex:1">

      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.turbomixer-dialog-button{
  background: #efefef;
  border: 1px solid;
  padding: 0.2em 1em;
  border-radius: 0.25em;
  cursor: pointer;
}
</style>