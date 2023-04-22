<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useRoute } from 'vue-router'
import { useRoomStore } from '/@src/stores/useRoom'
import { useGeolocation } from '@vueuse/core'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Maps 1')

const { coords, resume } = useGeolocation()
const route = useRoute()
const currentPosition = ref<{ longitude: number; latitude: number } | null>(null)

const roomDetail = computed(() => {
  return roomStore.getRoomDetail
})

const roomStore = useRoomStore()

useHead({
  title: 'Maps 1 - Sidebar - Vuero',
})

onMounted(() => {
  console.log('route -> ', route.params.id)
  resume()
})

watch(coords, (newPosition) => {
  console.log('current position change -> ', { newPosition })
  if (newPosition.latitude && newPosition.longitude) {
    currentPosition.value = newPosition
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
