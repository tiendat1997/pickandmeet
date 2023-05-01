<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { usePanels } from '/@src/stores/panels'

import { useRoomStore } from '/@src/stores/useRoom'
import mapboxgl from 'mapbox-gl'

const props = defineProps<{
  coords: any
}>()

const panels = usePanels()
const route: any = useRoute()
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

onMounted(() => {
  console.log('mounted -> ', props.coords)
})

watch(props.coords, async (newCoords: any) => {
  console.log('watchCoords -> ', newCoords)
})

watchPostEffect(() => {
  console.log('watchPostEffect -> ', props.coords)
  if (route.params.id && props.coords.longitude && props.coords.latitude) {
    console.log('current position change -> ', { coords: props.coords })
    // alert(
    //   `current position change -> ${JSON.stringify({
    //     longitude: props.coords.longitude,
    //     latitude: props.coords.latitude,
    //   })}`
    // )
    roomStore.joinRoom(route.params.id, {
      latitude: props.coords.latitude,
      longitude: props.coords.longitude,
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
