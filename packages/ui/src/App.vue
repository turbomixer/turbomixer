<script setup lang="ts">
import FileTreeNode from './components/FileTreeNode.vue';
import {firstValueFrom} from 'rxjs';
import {computed, getCurrentInstance, inject, nextTick, onMounted, onUnmounted, reactive, ref, unref, watch} from "vue";
import DropdownMenuGroup from "./components/DropdownMenuGroup.vue";
import DropdownMenuItem from "./components/DropdownMenuItem.vue";
import ActionBarButton from "./components/ActionBarButton.vue";
import ActionBarSelector from "./components/ActionBarSelector.vue";
import Tabbar from "./components/Tabbar.vue";
import TerminalView from "./views/TerminalView.vue";
import DialogManager from "./dialog/DialogManager.vue";
import {Context} from "@turbomixer/core";
import DropdownMenu from "./components/DropdownMenu.vue";
import NavigationTabbar from "./components/NavigationTabbar.vue";

const container = ref<HTMLDivElement|null>(null);

const project_title = ref("")

const currentToolBox = ref(null);

const ctx = inject<Context>('ctx');

onMounted(()=>{
})

onUnmounted(()=>{
  ctx?.navigation.detach();
})

watch(container,(newValue)=>{
  if(newValue){
    ctx?.navigation.attach(newValue);
  }else{
    ctx?.navigation.detach();
  }
})

ctx?.inject(['project'],async (ctx)=>{
  project_title.value = await firstValueFrom(ctx.project.project_name) as string;
  ctx.on('dispose',()=>{project_title.value = "";})
})

const dialogs = reactive({
  project:{
    new:false,
    open:false
  }
})

</script>

<template>
  <div class="turbomixer-app">
    <DialogManager v-model="dialogs"/>
    <div class="turbomixer-header">
      <div class="turbomixer-icon">
        TurboMixer IDE
      </div>
      <DropdownMenu>
        <DropdownMenuGroup title="项目" id="project">
          <DropdownMenuItem>新建</DropdownMenuItem>
          <DropdownMenuItem @click="dialogs.project.open = true">打开</DropdownMenuItem>
          <DropdownMenuItem >保存</DropdownMenuItem>
          <DropdownMenuItem >设置</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup title="编辑" id="edit"></DropdownMenuGroup>
        <DropdownMenuGroup title="运行" id="run">
          <DropdownMenuItem>在本地(调试)运行</DropdownMenuItem>
          <DropdownMenuItem>上传并运行</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup title="关于" id="about">
          <DropdownMenuItem>版本信息</DropdownMenuItem>
          <DropdownMenuItem>开源许可</DropdownMenuItem>
          <DropdownMenuItem>Github</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </div>
    <div class="turbomixer-subheader">
      <div class="turbomixer-subheader-title">
        <!----
        <span v-for="(path,i) in currentPath">
          {{path}}
          <span v-if="i < currentPath.length - 1">
            &gt;
          </span>
        </span>
        ------>
      </div>
      <div class="space"></div>
      <div class="turbomixer-subheader-action">
        <ActionBarSelector/>
        <ActionBarButton>
          √
        </ActionBarButton>

        <ActionBarButton>
          🕷️
        </ActionBarButton>

        <ActionBarButton>
          ▶️
        </ActionBarButton>

      </div>
    </div>
    <div class="turbomixer-main">
      <div style="width: 300px; height:calc(100% - 10px);padding:5px;border-right:1px solid rgb(229, 229, 229)">
        <FileTreeNode v-if="project_title" :resource="Array.from(ctx?.file.files.values() ?? [])[0]"></FileTreeNode>
      </div>
      <div style="flex:1;display: flex;flex-direction: column;">
        <NavigationTabbar></NavigationTabbar>
        <div class="turbomixer-editor" ref="container">

        </div>
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <!----<div class="turbomixer-editor turbomixer-editor-load-error" v-show="editorLoadError.enabled">
          <svg style="font-size: 4em;fill: #C1C9D7" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
          <div class="turbomixer-editor-load-error-title" style="color: #C1C9D7">
            {{editorLoadError.title}}
          </div>
          <span style="color:#C1C9D7">
            {{editorLoadError.body}}
          </span>
        </div>
        ------>
      </div>
    </div>
    <div class="turbomixer-terminal">
      <div class="turbomixer-terminal-header">
        <Tabbar :tabs="[
            {'id':'terminal','name':'控制台'},
            {'id':'output','name':'输出'},
            {'id':'debug','name':'调试'},
            {'id':'logging','name':'日志'},
        ]" v-model="currentToolBox" :closable="false"></Tabbar>
      </div>
      <div style="flex:1">

        <TerminalView v-show="currentToolBox == 'terminal'"></TerminalView>
      </div>
    </div>
    <div class="turbomixer-footer">
      Remote: Koishi v114.514 | 1 Errors, 0 Warnings | 编译失败，请根据错误标签页中的内容更正代码 | Debugger Connected
    </div>
  </div>
</template>

<style scoped>
.turbomixer-app{
  user-select: none;
  height:100%;
  display: flex;
  flex-direction: column;
}
.turbomixer-header{
  z-index: 3;
  height:30px;
  line-height: 30px;
  background-color: rgb(248, 248, 248);
  border-bottom: 1px solid rgb(229, 229, 229);
}

.turbomixer-icon{
  display: inline;
  padding-left: 20px;
  padding-right: 20px;
}

.turbomixer-subheader{
  z-index: 2;
  display: flex;
  height:30px;
  line-height: 30px;
  padding-left:20px;
  padding-right:20px;
  background-color: rgb(248, 248, 248);
  border-bottom: 1px solid rgb(229, 229, 229);
}

.turbomixer-main{
  flex:1;
  display: flex;
  flex-direction: row;
}

.turbomixer-footer{
  height:25px;
  line-height: 25px;
  background-color: rgb(248, 248, 248);
  border-top: 1px solid rgb(229, 229, 229);
}

.turbomixer-subheader-title{
  display: inline-block;
}

.turbomixer-subheader-action{
  display: inline-block;
}

.space{
  display: inline-block;
  content: ' ';
  flex:1;
}

.turbomixer-terminal{
  height:200px;
  display: flex;
  flex-direction: column;
}

.turbomixer-terminal-header{
  display: flex;
  height:30px;
  line-height: 30px;
  padding-left:20px;
  padding-right:20px;
  background-color: rgb(248, 248, 248);
  border-top: 1px solid rgb(229, 229, 229);
}
.turbomixer-editor{
  flex:1;
}

.turbomixer-editor-load-error{
  padding-top: 5em;
  text-align: center;
  padding-left: 3em;
  padding-right: 3em;
}

.turbomixer-editor-load-error-title{
  font-size: 2em;
}
</style>
