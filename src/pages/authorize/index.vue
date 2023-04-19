<script setup lang="ts">
import { useHead } from '@vueuse/head'

import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Main Dashboard')

useHead({
  title: 'Authorized Dashboard - My app',
})
</script>

<template>
  <div class="page-content-inner">
    <span>...</span>
  </div>
</template>
