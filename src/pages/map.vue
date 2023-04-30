<route lang="yaml">
meta:
  requiresAuth: true
</route>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useLayoutSwitcher } from '/@src/stores/layoutSwitcher'

const { isLoading } = useAuth0()
const layoutSwitcher = useLayoutSwitcher()
</script>

<template>
  <AppLayout :is="layoutSwitcher.dynamicLayoutComponent" nowrap>
    <!-- Content Wrapper -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade-fast" mode="out-in">
        <component
          :is="Component"
          :v-if="!isLoading"
          v-bind="layoutSwitcher.dynamicLayoutProps"
          nowrap
        />
      </Transition>
    </RouterView>
  </AppLayout>
</template>
