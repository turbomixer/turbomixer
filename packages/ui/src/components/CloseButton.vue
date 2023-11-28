<template>
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" class="turbomixer-tab-close"
       v-if="props.selection === props.tab?.key" @click.stop="removeNavigationItem(props.tab?.key)">
    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
    <path
        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
  </svg>
</template>
<script setup lang="ts">
import {inject} from "vue";
import {Context} from "@turbomixer/core";

const ctx = inject<Context>("ctx");
function removeNavigationItem(key){
  const item = ctx?.navigation.entities.getItemByKey(key);
  if(item)
  ctx?.navigation.remove(item.value);
}

const props = defineProps(['tab','selection'])
</script>
<style scoped>

.turbomixer-tab-close {
  line-height: 1em;
  height: 1em;
  position: relative;
  top: 0.15em;
}
</style>