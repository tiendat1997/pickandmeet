<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { useLayoutSwitcher } from '/@src/stores/layoutSwitcher'
import { usePanels } from '/@src/stores/panels'
import { useGeolocation } from '@vueuse/core'

import { useRoomStore } from '/@src/stores/useRoom'

const panels = usePanels()
const layoutSwitcher = useLayoutSwitcher()
const route: any = useRoute()
const { coords } = useGeolocation()

const roomStore = useRoomStore()
const roomDetail = computed(() => {
  return roomStore.getRoomDetail
})

useHead({
  title: 'Maps 1 - Sidebar - Vuero',
})

watch(coords, (newPosition) => {
  console.log('current position change -> ', { newPosition })
  if (newPosition.latitude !== Infinity && newPosition.longitude !== Infinity) {
    roomStore.joinRoom(route.params.id, {
      latitude: newPosition.latitude,
      longitude: newPosition.longitude,
    })
  }
})

onMounted(() => {
  console.log('route -> ', route.params.id)
})
</script>

<template>
  <component :is="layoutSwitcher.dynamicLayoutComponent">
    <MapsDashboard
      v-if="!!roomDetail.questionId"
      :coords="coords"
      :room-detail="roomDetail"
    >
      <template #header>
        <div class="content-section-header">
          <h2 class="title is-4 is-narrow">Maps 1</h2>

          <Toolbar class="desktop-toolbar">
            <ToolbarNotification />

            <a
              class="toolbar-link right-panel-trigger"
              aria-label="View activity"
              tabindex="0"
              @keydown.space.prevent="panels.setActive('activity')"
              @click="panels.setActive('activity')"
            >
              <i aria-hidden="true" class="iconify" data-icon="feather:grid"></i>
            </a>
          </Toolbar>
        </div>
      </template>
    </MapsDashboard>
  </component>
</template>
