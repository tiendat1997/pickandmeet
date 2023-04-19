<script setup lang="ts">
import { useHead } from '@vueuse/head'

import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useQuestionStore } from '/@src/stores/questions'

const viewWrapper = useViewWrapper()
const store = useQuestionStore()
viewWrapper.setPageTitle('Your Events')

useHead({
  title: 'List View 1 - Sidebar - Vuero',
})

const getQuestions = computed(() => {
  return store.getQuestions
})

onMounted(() => {
  store.fetchQuestions()
})
</script>

<template>
  <div class="page-content-inner">
    <QuestionList :questions="getQuestions" />
  </div>
</template>
