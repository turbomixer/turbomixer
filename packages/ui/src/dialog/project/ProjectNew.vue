<script setup lang="ts">
import {computed} from "vue";
import Dialog from "../Dialog.vue";

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
  <Dialog v-model="model" :closable="true" :mask="true">
    <div style="width: 40em;min-height: 20em;background: white;border: 1px solid #cccccc;padding-bottom: 0.5em;display: flex;flex-direction: column">
      <div style="width: 100%;height: 2em;line-height: 2em;background: #eeeeee">
        <span style="padding-left: 1em">
          新建一个TurboMixer项目
        </span>
      </div>
      <div style="display: flex;flex-direction: column;flex:1">
        <div style="padding: 1em;flex:1">
          插件名称:<input style="width: 20em" value="未命名插件_cbfe98cd"/><br/>
          保存位置:<select style="width: 20em"><option>Koishi服务器(172.**.**.24)</option></select><br/>
          输出语言:<select style="width: 20em"><option>JavaScript</option></select><br/>
          运行目标:<select style="width: 20em"><option>Koishi</option></select><br/>
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button">下一步</button>
        </div>
      </div>
      <div style="display: flex;flex-direction: column;flex:1">
        <div style="padding: 1em;flex:1">

        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button">创建</button>
        </div>
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