<script setup lang="ts">
import FileTreeNode from './components/FileTreeNode.vue';
import {reactive, ref} from "vue";
import DropdownMenu from "./components/DropdownMenu.vue";
import DropdownMenuItem from "./components/DropdownMenuItem.vue";
import ActionBarButton from "./components/ActionBarButton.vue";
import ActionBarSelector from "./components/ActionBarSelector.vue";
import Tabbar from "./components/Tabbar.vue";
import TerminalView from "./views/TerminalView.vue";

const container = ref<HTMLDivElement|null>(null);
defineExpose({
  getContainer(){
    return container?.value;
  }
})

const menuSelection = ref(null);

const project = ref<null|{
  name:string
}>(null);

const currentPath = reactive(['未命名项目','未命名Blockly代码'])

const currentWindow = ref(null);
const currentToolBox = ref(null);

const editorTabBars = reactive([
  {'id':'cGhc','name':'未命名Blockly代码'},
  {'id':'cGh2','name':'测试HTTP请求'}
])
</script>

<template>
  <div class="turbomixer-app">
    <div class="turbomixer-header">
      <div class="turbomixer-icon">
        TurboMixer IDE
      </div>
      <DropdownMenu title="项目" id="project" v-model="menuSelection">
        <DropdownMenuItem v-model="menuSelection">打开</DropdownMenuItem>
        <DropdownMenuItem v-model="menuSelection">保存</DropdownMenuItem>
      </DropdownMenu>
      <DropdownMenu title="编辑" id="edit" v-model="menuSelection"></DropdownMenu>
      <DropdownMenu title="运行" id="run" v-model="menuSelection"></DropdownMenu>
      <DropdownMenu title="关于" id="about" v-model="menuSelection"></DropdownMenu>
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
        <FileTreeNode :tree="{'name':'签到插件','children':[
          {'name':'未命名Blockly程序','activate':true},
          {'name':'未命名Blockly程序(1)'},
        ]}"></FileTreeNode>
      </div>
      <div style="flex:1">
        <Tabbar :tabs="editorTabBars" v-model="currentWindow" :closable="true" @close="(id:number)=>editorTabBars.splice(editorTabBars.findIndex(tab=>tab.id == id),1)"></Tabbar>
        <div class="turbomixer-editor" ref="container">

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
</style>
