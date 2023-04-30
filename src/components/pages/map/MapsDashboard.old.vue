<script setup lang="ts">
// import { useThemeColors } from '/@src/composable/useThemeColors'
import { useDarkmode } from '/@src/stores/darkmode'
import 'mapbox-gl/src/css/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import mapboxgl from 'mapbox-gl'
import { createApp as createClientComponent } from 'vue'
import CustomMarker from './CustomMarker.vue'
import VotePopup from './VotePopup.vue'

import { usePanels } from '/@src/stores/panels'
import { useRoomStore } from '/@src/stores/useRoom'
import { useAuth0 } from '@auth0/auth0-vue'

const panels = usePanels()
// const themeColors = useThemeColors()
const roomStore = useRoomStore()
const { user } = useAuth0()

const props = defineProps<{
  reversed?: boolean
  roomDetail: any
  currentPosition: any
}>()

const darkmode = useDarkmode()
const selectedFeature = ref()
const mapElement = shallowRef<HTMLElement>()
const geocoderElement = shallowRef<HTMLElement>()
const popupElement = shallowRef<HTMLElement>()
const map = shallowRef<Map>()
const geocoder = shallowRef<any>()
const bounds: any = ref<any>()
const globalMarkers: any = ref<any>({})
const globalMemberMarkers: any = ref<any>({})
const votePopupRef: any = shallowRef<Popup>()

const getFeatures: any = computed(() => {
  return roomStore.getFeatures
})

const getCurrentUserId: any = computed(() => {
  return user.value.sub
})

const getQuestionId: any = computed(() => {
  return roomStore.getQuestionId
})

function loadFeatures() {
  if (!map.value) {
    return
  }
  const featureList = getFeatures.value
  // add markers to map
  for (const feature of featureList) {
    // create a HTML element for each feature
    const markerEl = document.createElement('div')
    markerEl.className = 'marker'

    const markerContent = document.createElement('div')
    markerEl.appendChild(markerContent)

    // Create popup
    const divElement = document.createElement('div')
    votePopupRef.value = new mapboxgl.Popup({ offset: 5 }).setDOMContent(divElement)
    const coordinates = {
      lng: feature.coordinates[0],
      lat: feature.coordinates[1],
    }

    const markerKey = String(coordinates.lng) + '_' + String(coordinates.lat)
    const oldMarker = globalMarkers[markerKey]
    // make a marker for each feature and add it to the map
    const marker = new mapboxgl.Marker(markerEl)
      .setLngLat(feature.coordinates)
      .setPopup(votePopupRef.value)
      .addTo(map.value)

    // Remove old marker from the map
    if (oldMarker) {
      oldMarker.remove()
    }

    globalMarkers[markerKey] = marker

    // POPUP Component
    createClientComponent(CustomMarker, { count: feature.count ?? 0 }).mount(
      markerContent
    )

    const userId = getCurrentUserId.value
    // POPUP Component
    createClientComponent(VotePopup, {
      userId: userId,
      questionId: getQuestionId.value,
      placeName: feature.properties.placeName,
      category: feature.properties.category,
      displayAddress: feature.properties.displayAddress,
      coordinates: coordinates,
      submitVote: roomStore.submitVote,
      submitRemoveVote: roomStore.submitRemoveVote,
      closePopup: votePopupRef.value.remove,
      isVote: !(feature?.userIds ?? []).includes(userId),
    }).mount(divElement)
  }
}

onMounted(() => {
  console.log('onMounted: MapDashboard -> ', {
    position: props.currentPosition,
    roomDetail: props.roomDetail,
  })
  Promise.all([
    import('mapbox-gl').then((m) => m.default),
    import('@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min.js').then(
      (m) => m.default
    ),
  ]).then(([mapboxgl, MapboxGeocoder]) => {
    if (!mapElement.value || !geocoderElement.value) {
      return
    }
    // You can set the VITE_MAPBOX_ACCESS_TOKEN inside .env file
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string

    map.value = new mapboxgl.Map({
      container: mapElement.value,
      style: darkmode.isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      center: [props.currentPosition.longitude, props.currentPosition.latitude],
      zoom: 12,
    })

    geocoder.value = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: true,
    })

    map.value.on('style.load', () => {
      const loadingStyles = () => {
        if (!map.value?.isStyleLoaded()) {
          setTimeout(loadingStyles, 1500)
          return
        }
      }
      loadingStyles()
    })

    geocoderElement.value.appendChild(geocoder.value.onAdd(map.value))
  })
})

watch(
  () => darkmode.isDark,
  () => {
    if (!map.value) {
      return
    }

    if (darkmode.isDark) {
      map.value.setStyle('mapbox://styles/mapbox/dark-v10')
    } else {
      map.value.setStyle('mapbox://styles/mapbox/light-v10')
    }
  }
)

watch(
  () => props.roomDetail.members,
  async (members) => {
    if (!map.value) {
      return
    }

    for (const memberLocation of members) {
      console.log('generateMarkers -> ', memberLocation)
      const coordinates = memberLocation.geoJson.coordinates
      const memberId = memberLocation.uid
      const isCurrent = getCurrentUserId.value === memberId // user.sub === memberLocation.uid;
      const oldMarker = globalMemberMarkers[memberId]

      const marker = new mapboxgl.Marker({
        color: isCurrent ? 'red' : 'black',
      })
        .setLngLat(coordinates)
        .addTo(map.value)

      // Remove old marker from the map
      if (oldMarker) {
        oldMarker.remove()
      }

      globalMemberMarkers[memberId] = marker
      if (!bounds.value) {
        bounds.value = new mapboxgl.LngLatBounds(coordinates, coordinates)
      } else {
        bounds.value.extend(coordinates)
      }
    }

    const centerBound = bounds.value.getCenter()
    console.log('center bound location -> ', centerBound)
    await roomStore.fetchNearByLocations({
      longitude: centerBound.lng,
      latitude: centerBound.lat,
    })

    loadFeatures()
  }
)

watch(
  () => props.roomDetail.votes,
  async (votes: any[]) => {
    console.log('MapsDashboard::watchVotes -> ', votes)
    loadFeatures()
  }
)
</script>

<template>
  <div class="dashboard-map-wrapper">
    <div class="dashboard-map-wrapper-inner" :class="[props.reversed && 'is-reversed']">
      <div ref="mapElement" class="map-section"></div>
      <div ref="geocoderElement" class="geocoder"></div>
      <div ref="popupElement" style="display: none; visibility: hidden">
        <MapMarker
          v-if="selectedFeature"
          :logo="selectedFeature.properties.logo"
          :name="selectedFeature.properties.name"
          :opening-count="selectedFeature.properties.openingCount"
          :description="selectedFeature.properties.description"
        />
      </div>
      <div class="map-toolbar">
        <VIconButton
          circle
          aria-label="View activity"
          tabindex="0"
          icon="feather:grid"
          @keydown.space.prevent="panels.setActive('activity')"
          @click="panels.setActive('activity')"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.marker {
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
}

.has-top-nav {
  .dashboard-map-wrapper {
    top: 80px;
    height: calc(100% - 80px);
  }
}

.dashboard-map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .dashboard-map-wrapper-inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;

    &.is-reversed {
      flex-direction: row-reverse;
    }

    .map-section {
      position: relative;
      width: 100%;
    }
  }
}

.mapboxgl-popup {
  &.mapboxgl-popup-anchor-bottom {
    .mapboxgl-popup-tip {
      z-index: 30;
      position: relative;
      top: -2px;
    }
  }

  &.mapboxgl-popup-anchor-top {
    .mapboxgl-popup-tip {
      z-index: 30;
      position: relative;
      bottom: -2px;
    }
  }

  &.mapboxgl-popup-anchor-right {
    .mapboxgl-popup-tip {
      z-index: 30;
      position: relative;
      left: -2px;
    }
  }

  &.mapboxgl-popup-anchor-left {
    .mapboxgl-popup-tip {
      z-index: 30;
      position: relative;
      right: -2px;
    }
  }

  .mapboxgl-popup-content {
    border: 1px solid var(--border);
    box-shadow: var(--light-box-shadow);
    padding: 1.25rem;
    border-radius: 0.5rem;

    .map-box-location {
      .map-box-body {
        padding: 0.5rem 0;

        p {
          line-height: 1.4;
        }
      }
    }
  }
}

.geocoder {
  position: absolute;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  top: 1rem;
  left: 0;
  right: 0;
  margin: 0 auto;
}

.map-toolbar {
  position: absolute;
  z-index: 1;
  top: 1rem;
  right: 0;
  margin-right: 1.5rem;

  > button {
    width: 44px;
    height: 44px;
  }
}

.mapboxgl-ctrl-geocoder {
  min-width: 100% !important;
  border-radius: 0.65rem !important;
  border: 1px solid var(--border);
  box-shadow: var(--light-box-shadow);

  .mapboxgl-ctrl-geocoder--input {
    &:focus-visible {
      border-radius: 4px;
      outline-offset: var(--accessibility-focus-outline-offset);
      outline-width: var(--accessibility-focus-outline-width);
      outline-style: var(--accessibility-focus-outline-style);
      outline-color: var(--accessibility-focus-outline-color);
    }
  }

  .mapboxgl-ctrl-geocoder--suggestion-title {
    font-family: var(--font);
  }

  .mapboxgl-ctrl-geocoder--suggestion-address {
    font-family: var(--font);
  }

  .mapboxgl-ctrl-geocoder--icon-search {
    top: 13px;
    left: 12px;
    transition: stroke 0.3s;
    fill: var(--light-text);
  }

  .mapboxgl-ctrl-geocoder--pin-right > * {
    top: 11px !important;
    right: 11px !important;
  }

  .mapboxgl-ctrl-geocoder--button {
    background: none !important;
  }

  input {
    height: 44px;
    padding-left: 3rem;
    border-radius: 0.75rem;
    background: var(--white);
    transition: all 0.3s; // transition-all test

    &:focus {
      ~ .mapboxgl-ctrl-geocoder--icon-search {
        fill: var(--primary) !important;
      }
    }
  }
}

.is-dark {
  .dashboard-map-wrapper {
    .dashboard-map-wrapper-inner {
      .content-section {
        background: var(--dark-sidebar-dark-3);

        .content-section-body {
          .map-box {
            background: var(--dark-sidebar-light-3);
            border-color: var(--dark-sidebar-light-10);

            &.is-active {
              border-color: var(--primary) !important;
            }
          }
        }
      }
    }
  }

  .mapboxgl-popup {
    &.mapboxgl-popup-anchor-bottom {
      .mapboxgl-popup-tip {
        border-top-color: var(--dark-sidebar-dark-3);
      }
    }

    &.mapboxgl-popup-anchor-top {
      .mapboxgl-popup-tip {
        border-bottom-color: var(--dark-sidebar-dark-3);
      }
    }

    &.mapboxgl-popup-anchor-left {
      .mapboxgl-popup-tip {
        border-right-color: var(--dark-sidebar-dark-3);
      }
    }

    &.mapboxgl-popup-anchor-right {
      .mapboxgl-popup-tip {
        border-left-color: var(--dark-sidebar-dark-3);
      }
    }

    .mapboxgl-popup-content {
      background: var(--dark-sidebar-dark-3);
      border-color: var(--dark-sidebar-light-10);

      .mapboxgl-popup-close-button {
        color: var(--dark-dark-text) !important;
      }
    }
  }

  .mapboxgl-marker {
    svg {
      circle {
        fill: var(--dark-sidebar-light-3) !important;
      }
    }
  }

  .mapboxgl-ctrl-geocoder {
    background: var(--dark-sidebar-dark-3);
    border-color: var(--dark-sidebar-light-10);

    input {
      color: var(--white);
      background: var(--dark-sidebar-dark-3);
    }

    .suggestions-wrapper {
      .suggestions {
        background: var(--dark-sidebar-dark-3);
        border-color: var(--dark-sidebar-light-10);
      }
    }

    .suggestions > .active > a,
    .suggestions > li > a:hover {
      background: var(--dark-sidebar-dark-6);
    }

    .mapboxgl-ctrl-geocoder--suggestion-title {
      color: var(--dark-dark-text);
    }

    .mapboxgl-ctrl-geocoder--suggestion-address {
      color: var(--light-text);
    }
  }
}

@media only screen and (max-width: 767px) {
  .has-top-nav {
    .dashboard-map-wrapper {
      top: 0;
      height: 100%;
    }
  }

  .dashboard-map-wrapper {
    overflow-x: hidden;

    .dashboard-map-wrapper-inner {
      flex-direction: column;

      &.is-reversed {
        flex-direction: column;
      }

      .map-section {
        min-height: 100vh;
        width: 100%;
      }
    }
  }

  .geocoder {
    padding: 0 2rem;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .has-top-nav {
    .dashboard-map-wrapper {
      top: 0;
      height: 100%;
    }
  }

  .dashboard-map-wrapper {
    overflow-x: hidden;

    .dashboard-map-wrapper-inner {
      flex-direction: column;

      &.is-reversed {
        flex-direction: column;
      }

      .map-section {
        min-height: 100vh;
        width: 100%;
      }
    }
  }

  .geocoder {
    padding: 0 2rem;
  }
}
</style>
