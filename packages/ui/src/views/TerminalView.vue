<script setup lang="ts">
import Refresh from "../icons/Refresh.vue";
import {ref} from "vue";
const remotes = ref([])

</script>

<template>
  <div style="height: 100%;display: flex">
    <div style="width: 20em">
      <div style="border-bottom: 1px solid  rgb(240,240,240)">
        <div class="turbomixer-terminal-view-button">
          <Refresh/>
        </div>
      </div>
      <div class="turbomixer-select-group-entity">
        本地环境
      </div>
    </div>
    <div style="flex: 1;border-left: 1px solid rgb(240,240,240)">
      <div>
        <div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.turbomixer-terminal-view-button{
  display: inline-block;
  height: 1.5em;
  width: 1.5em;
  line-height: 1.5em;
  font-size: 1em;
  text-align: center;
  border-radius: 0.2em;
}
.turbomixer-terminal-view-button:hover{
  background: #eeeeee;
}
.turbomixer-select-group-entity:hover{
  background: #cccccc;
}

.turbomixer-select-group-entity.active{
  background: #bbbbff!important;
}
</style>