<route lang="yaml">
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useGeolocation } from '@vueuse/core'

const { isLoading } = useAuth0()
const { coords } = useGeolocation()
</script>

<template>
  <AppLayout>
    <!-- Content Wrapper -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade-fast" mode="out-in">
        <component
          :is="Component"
          :v-if="!isLoading && coords.longitude && coords.latitude"
          :coords="coords"
        />
      </Transition>
    </RouterView>
  </AppLayout>
</template>
