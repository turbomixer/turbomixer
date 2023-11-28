<script setup lang="ts">
import {inject, reactive, ref} from "vue";
import {Context, LinkedMapValue, NavigationStatus} from "@turbomixer/core";
import CloseButton from "./CloseButton.vue";

const ctx = inject<Context>("ctx");
const tabs = reactive<{key?:string,title?:string|null,status:number}[]>([]);
const navigationIds = new WeakMap();
const titleSubscriptions = new Set<Function>();
const model = ref("");

let selfIncrementId = 0;

function flatLinkedTable<T>(head:LinkedMapValue<T, any>):({value:T,key?:string})[]{
  return [{value:head.value,key:Array.from(head.keys.values())[0]},...(head.next?flatLinkedTable(head.next):[])];
}



ctx?.using(['navigation'],(ctx)=>{
  const reloadWindows = ()=>{
    titleSubscriptions.forEach(dispose=>dispose());
    titleSubscriptions.clear();

    while(tabs.length)tabs.pop();
    if(ctx.navigation.entities.head)
      tabs.push(...(flatLinkedTable(ctx.navigation.entities.head).filter(node=>node.key).map(node=>({
        title:node.value.getTitle().value,
        key:node.key,
        status:node.value.getStatus().value
      }))));

    tabs.forEach(tab=>{
      const item = ctx.navigation.entities.getItemByKey(tab.key as string)?.value;
      const titleSubscription = item?.getTitle().subscribe((value)=>{
        tab.title = value;
      })

      const statusSubscription = item?.getStatus().subscribe((status)=>{
        tab.status = status;
      })

      titleSubscriptions.add(()=>{
        statusSubscription?.unsubscribe();
        titleSubscription?.unsubscribe();
      });
    })
  }
  ctx.on('navigation/entity-changed',()=>{
    reloadWindows();
  })
  reloadWindows();
  const currentNavigationSubscription = ctx.navigation.current.subscribe((value)=>{
    if(value)
      model.value = Array.from(value.keys.values())[0]??'__UNKNOWN__';
    else model.value = '';
  })

  ctx.on('dispose',()=>currentNavigationSubscription.unsubscribe());
})
</script>

<template>
  <div class="turbomixer-tabbar">
    <div class="turbomixer-tabbar-scroller">
      <div class="turbomixer-tab" v-for="(tab,i) in tabs" :key="tab.key" :tm-dbg-key="tab.key " :class="[model == tab.key ? 'turbomixer-tab-activate' : '']" @click="ctx?.navigation.select(tab.key ?? '')">
        {{tab.title}}
        <template v-if="tab.status & NavigationStatus.UNSAVED"><span style="color: red">*</span> </template>
        <CloseButton :tab="tab" :selection="model"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.turbomixer-tabbar{
  overflow-x: scroll;
  height:30px;
  line-height: 30px;
  background-color: rgb(248, 248, 248);
}

.turbomixer-tabbar::-webkit-scrollbar{
  display: none;
}

.turbomixer-tab{
  display: inline-block;
  height:30px;
  line-height: 30px;
  padding-left: 10px;
  padding-right: 10px;
  flex-direction: row;
}

.turbomixer-tab-activate{
  background-color: rgb(255,255,255);
}

</style>