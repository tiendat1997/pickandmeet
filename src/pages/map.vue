<route lang="yaml">
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useLayoutSwitcher } from '/@src/stores/layoutSwitcher'
import { useCurrentPosition } from '/@src/stores/geolocation'

const { isLoading } = useAuth0()
const layoutSwitcher = useLayoutSwitcher()
const currentPositionStore = useCurrentPosition()
const coords = computed(() => {
  return currentPositionStore.coords
})
const loadingPosition = computed(() => {
  return currentPositionStore.loadingPosition
})

onMounted(() => {
  console.log('[map.vue] -> onMounted')
  currentPositionStore.fetchCurrentPosition()
})
</script>

<template>
  <AppLayout
    :is="layoutSwitcher.dynamicLayoutComponent"
    v-bind="layoutSwitcher.dynamicLayoutProps"
    nowrap
  >
    <!-- Content Wrapper -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade-fast" mode="out-in">
        <component
          :is="Component"
          :v-if="!isLoading && !loadingPosition"
          :coords="coords"
          nowrap
        />
      </Transition>
    </RouterView>
  </AppLayout>
</template>
