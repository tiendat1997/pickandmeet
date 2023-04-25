<script setup lang="ts">
import { useHead } from '@vueuse/head'

import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Invitation')

useHead({
  title: 'Invitation Page',
})
</script>

<template>
  <div class="page-content-inner">
    <span>Hello Kitty Luon</span>
  </div>
</template>
