<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useInvitationStore } from '/@src/stores/invitations'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Invitation')
const invitationStore = useInvitationStore()
const route = useRoute()

useHead({
  title: 'Invitation - My app',
})

const getInvitationInfo = computed(() => {
  return invitationStore.getInvitationInfo
})

onMounted(() => {
  const invitationCode = route.params.id
  invitationStore.fetchInvitationInfo(invitationCode)
})
</script>

<template>
  <div class="page-content-inner">
    <Invitation v-if="getInvitationInfo?._id" :invitation-info="getInvitationInfo" />
  </div>
</template>
