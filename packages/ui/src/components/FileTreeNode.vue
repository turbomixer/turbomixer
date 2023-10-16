<script lang="ts" setup>
import {computed, onMounted, reactive, ref} from 'vue';
import Angle from './Angle.vue'
const props = defineProps(['tree','level']);
const emits = defineEmits(['onItemClick'])
const enabled = ref(false);
const level = computed(()=>props.level ?? 0);
const className = computed(()=>[props.tree.activate ? 'activate' : ''].filter(t=>!!t))
function onClick(){
  if(props.tree.children){
    enabled.value=!enabled.value;
  }else{
    emits('onItemClick',props.tree.id,props.tree);
  }
}
</script>
<template>
  <div :class="className" class="hover-blink" :style="{'padding-left': (level*30)+'px'}">
    <div @click="onClick" style="user-select: none;" >
      <Angle :enabled="!enabled" v-if="props.tree.children"></Angle>
      <span style="font-size: 1em;line-height: 1em;">{{props.tree.name}}</span>
    </div>
  </div>
  <div v-if="enabled && props.tree.children">
    <FileTreeNode v-for="node in props.tree.children" :tree="node" :level="level+1" @on-item-click="(i,e)=>emits('onItemClick',i,e)"></FileTreeNode>
  </div>

</template>

<style scoped>
.hover-blink:hover{
  background: rgba(0,0,0,0.05);
}
.activate{
  background: rgba(0,0,255,0.1);
}
.activate:hover{
  background: rgba(0,0,255,0.1)!important;
}
</style>