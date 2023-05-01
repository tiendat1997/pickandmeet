<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { usePanels } from '/@src/stores/panels'
import { useGeolocation } from '@vueuse/core'
import { useRoomStore } from '/@src/stores/useRoom'
// import { useAuth0 } from '@auth0/auth0-vue'
import mapboxgl from 'mapbox-gl'

const panels = usePanels()
const route: any = useRoute()
const { coords } = useGeolocation()
// const { user } = useAuth0()

const roomStore = useRoomStore()
const roomDetail: any = computed(() => {
  return roomStore.getRoomDetail
})

const members: any = computed(() => {
  return roomStore.getMembers
})

const locations: any = computed(() => {
  return roomStore.getLocations
})

useHead({
  title: 'Maps 1 - Sidebar - Vuero',
})

watch(coords, (newPosition) => {
  console.log('current position change -> ', { newPosition })
  alert(
    `current position change -> ${JSON.stringify({
      lng: newPosition.longitude,
      lat: newPosition.latitude,
    })}`
  )
  if (newPosition.latitude !== Infinity && newPosition.longitude !== Infinity) {
    roomStore.joinRoom(route.params.id, {
      latitude: newPosition.latitude,
      longitude: newPosition.longitude,
    })
  }
})

watch(members, async (newMembers: any) => {
  console.log('watch::roomDetail members', { newMembers })
  let bounds: any
  for (const memberLocation of newMembers) {
    console.log('generateMarkers -> ', memberLocation)
    const coordinates = memberLocation.geoJson.coordinates
    if (!bounds) {
      bounds = new mapboxgl.LngLatBounds(coordinates, coordinates)
    } else {
      bounds.extend(coordinates)
    }
  }

  const centerBound = bounds.getCenter()
  console.log('center bound location -> ', centerBound)
  await roomStore.fetchNearByLocations({
    longitude: centerBound.lng,
    latitude: centerBound.lat,
  })
})

onMounted(() => {
  console.log('route -> ', route.params.id)
})
</script>

<template>
  <MapsDashboard
    v-if="!!roomDetail.questionId"
    :coords="coords"
    :locations="locations"
    :room-detail="roomDetail"
    :members="members"
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
  <IoT
    v-if="!!roomDetail.questionId"
    :room-detail="roomDetail"
    :current-position="coords"
  />
</template>
