<script setup lang="ts">
import {computed, ref} from "vue";
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

const wizard_step = ref(0);

const runtime = ref('');

const entry = ref('')
</script>

<template>
  <Dialog v-model="model" :closable="true" :mask="true">
    <div style="width: 40em;min-height: 20em;background: white;border: 1px solid #cccccc;padding-bottom: 0.5em;display: flex;flex-direction: column">
      <div style="width: 100%;height: 2em;line-height: 2em;background: #eeeeee">
        <span style="padding-left: 1em">
          新建一个TurboMixer项目
        </span>
      </div>
      <div style="display: flex;flex-direction: column;flex:1" v-if="wizard_step == 0">
        <div style="padding: 1em;flex:1">
          插件名称:<input style="width: 20em" value="未命名插件_cbfe98cd"/><br/>
          保存位置:<select style="width: 20em"><option>Koishi服务器(172.**.**.24)</option></select><br/>
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button" @click="wizard_step = 1">下一步</button>
        </div>
      </div>

      <div style="display: flex;flex-direction: column;flex:1" v-else-if="wizard_step == 1">
        <div style="padding: 1em;flex:1">
          你想运行在.....:<br/>
          <input type="radio" value="koishi" v-model="runtime">Koishi
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button" @click="wizard_step = 2">下一步</button>
        </div>
      </div>

      <div style="display: flex;flex-direction: column;flex:1" v-else-if="wizard_step == 2">
        <div style="padding: 1em;flex:1">
          你想用.....作为你的主要编程方式:<br/>

          <input type="radio" value="blockly" v-model="entry">积木编程(Blockly)<br/>
          <input type="radio" value="flow" v-model="entry">响应式流编程
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button" @click="wizard_step = 3">下一步</button>
        </div>
      </div>

      <div style="display: flex;flex-direction: column;flex:1" v-else-if="wizard_step == 3">
        <div style="padding: 1em;flex:1">
          你想启用的插件:
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button" @click="wizard_step = 4">下一步</button>
        </div>
      </div>

      <div style="display: flex;flex-direction: column;flex:1" v-else-if="wizard_step == 4">
        <div style="padding: 1em;flex:1">
          确认配置信息:<br/>
          运行时环境:Koishi<br/>
          语言:TypeScript<br/>
          入口类型:积木编程(Blockly)<br/>
        </div>
        <div style="height: 1.5em;padding-top: 0.5em;border-top: 1px solid #cccccc;text-align: end;padding-right: 1em">
          <button class="turbomixer-dialog-button">完成</button>
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