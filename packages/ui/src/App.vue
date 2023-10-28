<script setup lang="ts">
import FileTreeNode from './components/FileTreeNode.vue';
import {computed, getCurrentInstance, inject, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import DropdownMenu from "./components/DropdownMenu.vue";
import DropdownMenuItem from "./components/DropdownMenuItem.vue";
import ActionBarButton from "./components/ActionBarButton.vue";
import ActionBarSelector from "./components/ActionBarSelector.vue";
import Tabbar from "./components/Tabbar.vue";
import TerminalView from "./views/TerminalView.vue";
import DialogManager from "./dialog/DialogManager.vue";
import {Context, FileReference, Project} from "@turbomixer/core";
import {Subscription,pairwise} from 'rxjs';
import {EditorTabbarItem, EditorTabbarManager} from "./editor";

const container = ref<HTMLDivElement|null>(null);
defineExpose({
  getContainer(){
    return container?.value;
  }
})

const menuSelection = ref(null);

const currentToolBox = ref(null);

const tabs = ref<any[]>([])


const dialogs = ref({
  project:{
    open:false,
    save:false,
    new:false
  }
})
const ctx = inject<Context>('ctx');

const project = ref<Project|null>(ctx?.project.current ?? null);

const instance = getCurrentInstance();

onMounted(()=>{
  subscribeProject(project.value as (Project|null));
  ctx?.on('project:update',(_project)=>{
    project.value = _project;
  });
})

function openGithubWindow(){
  window.open("https://github.com/turbomixer/turbomixer");
}
const currentWindow = ref<any>(null);


const editorLoadError = reactive({
  title:'',
  body:'',
  enabled:false
});

const projectName = ref("")

const currentPath = computed(()=>[projectName.value ?? '未命名项目'])

let oldSubscribers : Subscription[] = [];

function subscribeProject(project:Project|null){
  oldSubscribers.forEach(t=>t.unsubscribe());
  oldSubscribers = [];
  if(!project){
    return;
  }
  oldSubscribers.push(project.name.subscribe((value)=>{
    projectName.value = value;
  }));
}

watch(project,(changed)=>{
  subscribeProject(changed as (Project|null))
})

const tabbar = new EditorTabbarManager(ctx as Context);

tabbar.currentTab.pipe(pairwise()).subscribe(([oldValue,currentValue])=>{
  if(oldValue instanceof EditorTabbarItem){
    const value = ctx?.editor.save();
    if(value)
      oldValue.content.next(value);
  }
  currentWindow.value = currentValue?.id ?? null;
  if(currentValue instanceof EditorTabbarItem){
    ctx?.editor.open(currentValue.editor.value,currentValue.content.value);
  }
})

ctx?.editor.getEditorObservable().pipe(pairwise()).subscribe(([oldValue,currentValue])=>{
  oldValue?.detach?.();
  if(container.value)
    currentValue?.attach?.(container.value);
})


tabbar.tabs.subscribe((data)=>{
  tabs.value = data.map(tab => ({id:tab.id,name:tab.title.value}));
})

function openTabByFile(reference:FileReference){
  tabbar.file(reference);
}

function closeTabbarItem(id:string) {
  tabbar.close(id);
}
</script>

<template>
  <div class="turbomixer-app">
    <DialogManager v-model="dialogs"/>
    <div class="turbomixer-header">
      <div class="turbomixer-icon">
        TurboMixer IDE
      </div>
      <DropdownMenu title="项目" id="project" v-model="menuSelection">
        <DropdownMenuItem v-model="menuSelection" @click="dialogs.project.new = true">新建</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection" @click="dialogs.project.open = true">打开</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection">保存</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection">设置</DropdownMenuItem>
      </DropdownMenu>
      <DropdownMenu title="编辑" id="edit" v-model="menuSelection"></DropdownMenu>
      <DropdownMenu title="运行" id="run" v-model="menuSelection">
        <DropdownMenuItem v-model="menuSelection">在本地(调试)运行</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection">上传并运行</DropdownMenuItem>
      </DropdownMenu>
      <DropdownMenu title="关于" id="about" v-model="menuSelection">
        <DropdownMenuItem v-model="menuSelection">版本信息</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection">开源许可</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection" @click="openGithubWindow()">Github</DropdownMenuItem>
      </DropdownMenu>
    </div>
    <div class="turbomixer-subheader">
      <div class="turbomixer-subheader-title">
        <span v-for="(path,i) in currentPath">
          {{path}}
          <span v-if="i < currentPath.length - 1">
            &gt;
          </span>
        </span>
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
        <FileTreeNode v-if="project" :name="projectName" :accessor="project.files" @on-item-click="openTabByFile"></FileTreeNode>
      </div>
      <div style="flex:1;display: flex;flex-direction: column;">
        <Tabbar v-model="currentWindow" :tabs="tabs" :closable="true" @close="closeTabbarItem"></Tabbar>
        <div class="turbomixer-editor" ref="container" v-show="!editorLoadError.enabled">

        </div>
        <div class="turbomixer-editor turbomixer-editor-load-error" v-show="editorLoadError.enabled">
          <svg style="font-size: 4em;fill: #C1C9D7" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
          <div class="turbomixer-editor-load-error-title" style="color: #C1C9D7">
            {{editorLoadError.title}}
          </div>
          <span style="color:#C1C9D7">
            {{editorLoadError.body}}
          </span>
        </div>

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
