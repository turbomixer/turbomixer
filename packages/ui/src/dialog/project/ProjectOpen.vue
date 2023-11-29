<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import Dialog from "../Dialog.vue";
import {inject} from "vue";
import {Context} from "@turbomixer/core";

const ctx = inject<Context>('ctx');

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

const clients = ref<any[]>([]);

onMounted(()=>{
  ctx?.inject(['clients'],async (ctx:Context)=>{
    clients.value = ctx.clients.list().map((client)=>({
      id:client.key,
      name:client.name
    }))
    if(clients.value.map(client=>client.id).indexOf(currentClient.value) == -1 && clients.value.length>0){
      currentClient.value = clients.value[0].id;
    }
  })
})


const currentClient = ref("")

watch(currentClient,async (clientKey)=>{
  projects.value = (await ctx?.clients.get(clientKey)?.list()) ?? null;
})

const projects = ref<any[] | null>(null)
const selectedProject = ref<any[] | null>(null)

async function openProject(id:string){
  (await ctx?.clients.get(currentClient.value)?.open(id));
  model.value = false;
}
</script>

<template>
  <Dialog v-model="model" :closable="true" :mask="true">
    <div style="width: 40em;min-height: 20em;background: white;border: 1px solid #cccccc;padding-bottom: 0.5em;display: flex;flex-direction: column">
      <div style="width: 100%;height: 2em;line-height: 2em;background: #eeeeee">
        <span style="padding-left: 1em">
          打开一个TurboMixer项目
        </span>
      </div>
      <div style="display: flex;flex-direction: row;flex:1">
        <div style="width: 30%;border-right: 1px solid rgb(229, 229, 229)">
          <div v-for="(client) in clients"
               :key="client.id"
               class="turbomixer-dialog-select-group-entity"
               :class="currentClient == client.id?['active']:[]"
               @click="currentClient = client.id"
          >
            {{client.name}}
          </div>
        </div>
        <div style="width: 70%">
          <div v-if="projects == null" style="margin-top:50px;text-align: center">
            加载中.....
          </div>
          <div v-else>
            <div
                v-for="(project) in projects"
                :key="project.id"
                class="turbomixer-dialog-select-group-entity"
                style="padding-top: 10px;padding-bottom: 10px;border-bottom: 1px solid #dddddd"
                :class="selectedProject == project.id?['active']:[]"
                @click="selectedProject = project.id"
                @dblclick="openProject(project.id)"
            >
              {{project.name}}
            </div>

          </div>
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
.turbomixer-dialog-select-group-entity{
  padding: 5px;
}

.turbomixer-dialog-select-group-entity:hover{
  background: #cccccc;
}

.turbomixer-dialog-select-group-entity.active{
  background: #bbbbff!important;
}
</style>