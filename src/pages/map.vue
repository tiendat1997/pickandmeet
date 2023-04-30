<route lang="yaml">
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { isLoading } = useAuth0()
</script>

<template>
  <!-- Content Wrapper -->
  <RouterView v-slot="{ Component }">
    <Transition name="fade-fast" mode="out-in">
      <component :is="Component" :v-if="!isLoading" />
    </Transition>
  </RouterView>
</template>
