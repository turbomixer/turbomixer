<script lang="ts" setup>
import {
  Context,
  DirectoryAccessor,
  FileAccessor,
  FileResourceAccessor,
  ProjectDirectoryChildren
} from "@turbomixer/core";
import Angle from "./Angle.vue";
import {computed, onMounted, onUnmounted, watch, ref, toRef, inject} from "vue";
import {filter, connect, map, merge, combineLatest, BehaviorSubject, Observable, mergeMap, switchMap, tap} from 'rxjs';
import {useObservable, toObserver, from as fromRef} from "@vueuse/rxjs";
import _ from 'lodash';
import {cache, extractMap} from "../reactive";

const accessor: {
  directory?: DirectoryAccessor,
  resource?: FileResourceAccessor,
  file?: FileAccessor,
  level?: number
} = defineProps(['directory', 'resource', 'file', 'level']);

const level = computed(() => accessor.level ?? 0)

const accessorRef = computed(() => accessor.resource ?? accessor.directory ?? accessor.file ?? null)

const accessorObserver = new BehaviorSubject<DirectoryAccessor | FileResourceAccessor | FileAccessor | null>(accessorRef.value);

watch(accessorRef, (accessor) => {
  accessorObserver.next(accessor);
})


const title = useObservable(accessorObserver.pipe(map((assessor) => assessor?.name), switchMap((x) => x ?? 'Unknown')))

const directoryAccessor = computed(() => accessor.resource?.root || accessor.directory);

let directoryAccessorSubject: BehaviorSubject<DirectoryAccessor | undefined> | undefined;

let subscription: null | (() => void) = null;

let activeWatchers : Set<()=>void> = new Set;
onMounted(() => {
  directoryAccessorSubject = new BehaviorSubject(directoryAccessor.value);
  const _sub = directoryAccessorSubject.pipe(
      filter(accessor => !!accessor),
      connect(
          shared => combineLatest({
            files: shared.pipe(
                mergeMap(async accessor => await accessor?.watch()),
                tap({
                  next:(watcher)=>activeWatchers.add(()=>watcher?.complete()),
                  finalize:()=>{
                    activeWatchers.forEach((cb)=>cb());
                    activeWatchers.clear();
                  }
                }),
                mergeMap(o => (o ?? []))
            ),
            accessor: shared
          })
      ),
          map<
              { files: ProjectDirectoryChildren[], accessor?: DirectoryAccessor },
              (ProjectDirectoryChildren & { accessor?: DirectoryAccessor })[]
          >((value) => value.files.map((file) => ({...file, accessor: value.accessor}))),
          cache('name', (file) => file.type == 'directory' ? file.accessor?.directory(file.name) : file.accessor?.file(file.name)),
          connect(
              shared => combineLatest({
                names: shared.pipe(
                    map(v => v.map(s => s?.name).map(s => s instanceof BehaviorSubject ? s.asObservable() : (s as Observable<string>))),
                    extractMap()
                ),
                file: shared
              })
          ),
     map((value) => value.names.map((item, index) => ({
        name: item,
        accessor: value.file[index]
      }))),


      map(value => {
        return {
          file: value.filter(i => (i.accessor && !('hasChildren' in i.accessor))).sort((a, b) => (a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))),
          directory: value.filter(i =>(i.accessor &&'hasChildren' in i.accessor)).sort((a, b) => (a.name > b.name ? 1 : (a.name < b.name ? -1 : 0)))
        }
      }))
      .subscribe((value) => {
        directories.value = value.directory;
        files.value = value.file;
      });
  subscription = () => _sub.unsubscribe();
})

watch(directoryAccessor, (value?: DirectoryAccessor) => {
  directoryAccessorSubject?.next(value)
});

onUnmounted(() => {
  directoryAccessorSubject?.complete()
  directoryAccessorSubject = undefined;
  subscription?.();
});

const directories = ref<any[]>([])

const files = ref<any[]>([])

const enabled = ref(false);

function onClick() {
  if (directoryAccessor.value) {
    enabled.value = !enabled.value;
  }
}

const ctx = inject<Context>('ctx');

function openFile(){
  if(accessor.file){
    ctx?.file.open(accessor.file);
  }
}

</script>
<template>
  <div class="hover-blink" :style="{'padding-left': (level*30)+'px'}">
    <div @click="onClick" @dblclick="openFile" style="user-select: none;">
      <Angle :enabled="!enabled" v-if="directoryAccessor"></Angle>
      <span style="font-size: 1em;line-height: 1em;">{{ title }}</span>
    </div>
  </div>
  <div v-if="enabled && directoryAccessor">
    <FileTreeNode v-for="directory in directories" :directory="directory.accessor" :key="directory.name"
                  :level="level+1"></FileTreeNode>
    <FileTreeNode v-for="file in files" :file="file.accessor" :key="file.name" :level="level+1"></FileTreeNode>
  </div>
</template>

<style scoped>
.hover-blink:hover {
  background: rgba(0, 0, 0, 0.05);
}

.activate {
  background: rgba(0, 0, 255, 0.1);
}

.activate:hover {
  background: rgba(0, 0, 255, 0.1) !important;
}
</style>