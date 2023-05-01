<route lang="yaml">
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useCurrentPosition } from '/@src/stores/geolocation'

const { isLoading } = useAuth0()
const currentPositionStore = useCurrentPosition()
const coords = computed(() => {
  return currentPositionStore.coords
})
const loadingPosition = computed(() => {
  return currentPositionStore.loadingPosition
})

onMounted(() => {
  console.log('[invitation.vue] -> onMounted')
  currentPositionStore.fetchCurrentPosition()
})
</script>

<template>
  <AppLayout>
    <!-- Content Wrapper -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade-fast" mode="out-in">
        <component
          :is="Component"
          :v-if="!isLoading && !loadingPosition"
          :coords="coords"
        />
      </Transition>
    </RouterView>
  </AppLayout>
</template>
