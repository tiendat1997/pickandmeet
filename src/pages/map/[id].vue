<script setup lang="ts">
import { useHead } from '@vueuse/head'

import { useViewWrapper } from '/@src/stores/viewWrapper'
import { usePosition } from '/@src/stores/position'
import { useRoute } from 'vue-router'
import { useRoomStore } from '/@src/stores/useRoom'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Maps 1')

const positionStore = usePosition()
const route = useRoute()

const currentPosition = computed(() => {
  return positionStore.getPosition
})

const roomDetail = computed(() => {
  return roomStore.getRoomDetail
})

const roomStore = useRoomStore()

useHead({
  title: 'Maps 1 - Sidebar - Vuero',
})

onMounted(() => {
  console.log('route -> ', route.params.id)
  positionStore.initGeoLocation()
})

watch(currentPosition, (newPosition) => {
  console.log('current position change -> ', { newPosition })
  if (newPosition.latitude && newPosition.longitude) {
    roomStore.joinRoom(route.params.id, {
      latitude: newPosition.latitude,
      longitude: newPosition.longitude,
    })
  }
})
</script>

<template>
  <AppLayout nowrap>
    <!-- Content Wrapper -->
    <MapsDashboard
      v-if="currentPosition?.latitude && currentPosition?.longitude"
      :room-detail="roomDetail"
      :current-position="currentPosition"
    />
    <IoT
      v-if="
        currentPosition?.latitude && currentPosition?.longitude && !!roomDetail.questionId
      "
      :room-detail="roomDetail"
      :current-position="currentPosition"
    />
  </AppLayout>
</template>
