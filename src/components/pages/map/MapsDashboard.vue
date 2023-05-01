<script setup lang="ts">
import { type Map, Popup, Marker } from 'mapbox-gl'
import { useThemeColors } from '/@src/composable/useThemeColors'
import { useDarkmode } from '/@src/stores/darkmode'
import 'mapbox-gl/src/css/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { useRoomStore } from '/@src/stores/useRoom'
import { useAuth0 } from '@auth0/auth0-vue'

const themeColors = useThemeColors()

const props = defineProps<{
  roomDetail: any
  coords: any
  members: any[]
  locations: any[]
  reversed?: boolean
}>()

const roomStore = useRoomStore()
const darkmode = useDarkmode()
const selectedFeature = ref()
const selectedFeatureLatLng = ref()
const mapElement = shallowRef<HTMLElement>()
const geocoderElement = shallowRef<HTMLElement>()
const popupElement = shallowRef<HTMLElement>()
const map = shallowRef<Map>()
const popup = shallowRef<Popup>()
const geocoder = shallowRef<any>()
const globalMemberMarkers: any = ref<any>({})
const isVote = ref<null | Boolean>(null)
const { user } = useAuth0()

function loadMemberLayers() {
  if (!map.value) {
    return
  }

  for (const memberLocation of props.members) {
    console.log('generateMarkers -> ', memberLocation)
    const coordinates = memberLocation.geoJson.coordinates
    const memberId = memberLocation.uid
    const isCurrent = false // getCurrentUserId.value === memberId // user.sub === memberLocation.uid;
    const oldMarker = globalMemberMarkers[memberId]

    const marker = new Marker({
      color: isCurrent ? 'red' : 'black',
    })
      .setLngLat(coordinates)
      .addTo(map.value)

    // Remove old marker from the map
    if (oldMarker) {
      oldMarker.remove()
    }

    globalMemberMarkers[memberId] = marker
  }
}

function loadLocationLayers() {
  if (!map.value) {
    return
  }

  // Do nothing if source already added
  if (map.value.getSource('places')) {
    const source = map.value.getSource('places') as any
    return source.setData(props.locations as any)
  }

  map.value.addSource('places', {
    type: 'geojson',
    data: props.locations as any,
  })
  // Add a layer showing the places.
  map.value.addLayer({
    id: 'places',
    type: 'circle',
    source: 'places',
    paint: {
      'circle-color': darkmode.isDark ? themeColors.accent : themeColors.primary,
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': darkmode.isDark
        ? themeColors.accentLight
        : themeColors.primaryMedium,
    },
  })

  map.value.on('click', 'places', (e: any) => {
    console.log('click -> ', e.features[0])
    selectedFeature.value = e.features[0]
    selectedFeatureLatLng.value = e.lngLat
    const userIds = JSON.parse(e.features[0]?.properties?.userIds ?? null)
    isVote.value = !(userIds ?? []).includes(user.value.sub)
  })

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.value.on('mouseenter', 'places', () => {
    if (!map.value) {
      return
    }

    map.value.getCanvas().style.cursor = 'pointer'
  })

  // Change it back to a pointer when it leaves.
  map.value.on('mouseleave', 'places', () => {
    if (!map.value) {
      return
    }

    map.value.getCanvas().style.cursor = ''
  })
}

onMounted(() => {
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
        ? 'mapbox://styles/mapbox/dark-v10'
        : 'mapbox://styles/mapbox/light-v10',
      center: [props.coords.longitude, props.coords.latitude],
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

        loadLocationLayers()
        loadMemberLayers()
      }
      loadingStyles()
    })

    geocoderElement.value.appendChild(geocoder.value.onAdd(map.value))
  })
})

watchPostEffect(() => {
  if (!selectedFeature.value || !popupElement.value || !map.value) {
    return
  }

  const feature = selectedFeature.value
  const { geometry } = feature
  const coordinates = geometry.coordinates.slice()
  const userIds = JSON.parse(feature?.properties?.userIds ?? null)
  const isVote = !(userIds ?? []).includes(user.value.sub)

  if (popup.value) {
    popup.value.remove()
  }

  popup.value = new Popup()
    .setLngLat(coordinates)
    .setHTML(popupElement.value.innerHTML)
    .addTo(map.value)

  const btnSubmit = document.getElementById('vote-popup-btn-submit')
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      console.log('CLICK -> ', {
        isVote,
        properties: feature.properties,
      })
      const coordinatesInProperties = JSON.parse(
        feature.properties?.coordinates
      )?.coordinates
      if (isVote) {
        // todo: handle submit vote
        let payload = {
          questionId: props.roomDetail.questionId,
          coordinates: {
            lng: coordinatesInProperties[0],
            lat: coordinatesInProperties[1],
          },
          locationMetadata: {
            placeName: feature.properties.placeName,
            category: feature.properties.category,
            displayAddress: feature.properties.address,
          },
        }
        console.log('PAYLOAD -> ', payload)
        btnSubmit.classList.add('is-loading')
        await roomStore.submitVote(payload)
        btnSubmit.classList.remove('is-loading')

        popup.value?.remove()
      } else {
        // todo: handle submit unvote
        let payload = {
          questionId: props.roomDetail.questionId,
          coordinates: {
            lng: coordinatesInProperties[0],
            lat: coordinatesInProperties[1],
          },
        }
        console.log('PAYLOAD -> ', payload)
        btnSubmit.classList.add('is-loading')
        await roomStore.submitRemoveVote(payload)

        btnSubmit.classList.remove('is-loading')
        popup.value?.remove()
      }
    })
  }
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
  () => props.members,
  () => {
    loadMemberLayers()
  }
)

watch(
  () => props.locations,
  () => {
    console.log('LOCATION CHANGES -> ', props.locations)
    loadLocationLayers()
  }
)
</script>

<template>
  <div class="dashboard-map-wrapper">
    <div class="dashboard-map-wrapper-inner" :class="[props.reversed && 'is-reversed']">
      <div ref="mapElement" class="map-section"></div>
      <div ref="geocoderElement" class="geocoder"></div>
      <div ref="popupElement" style="display: none; visibility: hidden">
        <VotePopup
          v-if="selectedFeature"
          :question-id="roomDetail.questionId"
          :feature="selectedFeature"
          :is-vote="isVote"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
        height: 100vh;
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
        min-height: 100%;
        width: 100%;
      }
    }
  }

  .geocoder {
    padding: 0 2rem;
  }
}
</style>
