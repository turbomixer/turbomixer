<script setup lang="ts">
  import {computed} from "vue";

  const props = defineProps(['tabs','modelValue','closable']);
  const emit = defineEmits(['update:modelValue','close']);
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
  <div class="turbomixer-tabbar">
    <div class="turbomixer-tab" v-for="(tab,i) in (props.tabs)" :key="tab.id" :class="[model == tab.id ? 'turbomixer-tab-activate' : '']" @click="model = tab.id">
      {{tab.name}}
      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" class="turbomixer-tab-close" v-if="props.closable && model == tab.id" @click.stop="emit('close',tab.id)">
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.turbomixer-tabbar{
  height:30px;
  line-height: 30px;
  background-color: rgb(248, 248, 248);
}

.turbomixer-tab{
  display: inline-block;
  height:30px;
  line-height: 30px;
  padding-left: 10px;
  padding-right: 10px;
}

.turbomixer-tab-activate{
  background-color: rgb(255,255,255);
}

.turbomixer-tab-close{
  line-height: 1em;
  height: 1em;
  position: relative;
  top:0.15em;
}
</style>