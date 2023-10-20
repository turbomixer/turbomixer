<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, toRef, watch} from 'vue';
import Angle from './Angle.vue'
import {DirectoryAccessor, FileEntity} from "@turbomixer/core/lib/file";
const props = defineProps(['accessor','name','level','file']);
const emits = defineEmits(['onItemClick'])
const enabled = ref(false);
const level = computed(()=>props.level ?? 0);
const className = computed(()=>[''].filter(t=>!!t))

const listener = ref<any>(null);

const accessor = toRef(props,'accessor');

function onClick(){
  if(props.accessor){
    enabled.value=!enabled.value;
  }else{
    console.info("File",props.file)
    emits('onItemClick',props.file);
  }
}

watch(enabled,async (newEnabled)=>{
  if(newEnabled){
    await generateFileList();
    listener.value = await props.accessor.watch(directoryUpdate);
  }else{
    if(listener.value && typeof listener.value == 'function')
      listener.value();
  }
})

onUnmounted(()=>{
  console.info("Handler dispose!")
  if(listener.value && typeof listener.value == 'function')
    listener.value();
});

interface CachedAccessor{
  accessor?:DirectoryAccessor
}

const directories = ref<(FileEntity & CachedAccessor)[]>([]) , files = ref<FileEntity[]>([])

async function generateFileList(){
  console.info("Generate file list for",props.accessor.path());
  const _files : FileEntity[] = await props.accessor.list();
  directories.value = _files.filter(f=>f.type == 'directory').sort((a,b)=>a.name.localeCompare(b.name))
  files.value = _files.filter(f=>f.type == 'file').sort((a,b)=>a.name.localeCompare(b.name))
}

watch(accessor,(value,oldValue)=>{
  if(value.path() != oldValue.path()){
    // Accessor changed
    nextTick(()=>generateFileList());
  }
})

function directoryUpdate(entity:FileEntity,type:'add'|'remove'|'rename'){
  switch (type) {
    case "add":
      (entity.type == 'file' ? files : directories).value.push(entity);
      break;
    case "remove":
      const target = (entity.type == 'file' ? files : directories).value;
      target.splice(target.findIndex(t=>t.name == entity.name),1);
  }
}
</script>
<template>
  <div :class="className" class="hover-blink" :style="{'padding-left': (level*30)+'px'}">
    <div @click="onClick" style="user-select: none;" >
      <Angle :enabled="!enabled" v-if="accessor"></Angle>
      <span style="font-size: 1em;line-height: 1em;">{{ name }}</span>
    </div>
  </div>
  <div v-if="enabled && accessor">
    <FileTreeNode v-for="directory in directories" :name="directory.name" :accessor="accessor.directory(directory.name)" :level="level+1" @on-item-click="(e)=>emits('onItemClick',e)"></FileTreeNode>
    <FileTreeNode v-for="file in files" :name="file.name" :file="accessor.reference(file.name)" :level="level+1" @on-item-click="(e)=>emits('onItemClick',e)"></FileTreeNode>
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