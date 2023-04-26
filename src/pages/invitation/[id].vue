<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useInvitationStore } from '/@src/stores/invitations'
import { useGeolocation } from '@vueuse/core'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Invitation')
const invitationStore = useInvitationStore()
const route = useRoute()
const { coords, resume } = useGeolocation()

const currentPosition = ref<{ longitude: number; latitude: number } | null>(null)

useHead({
  title: 'Invitation - My app',
})

const getInvitationInfo = computed(() => {
  return invitationStore.getInvitationInfo
})

watch(coords, (newPosition) => {
  console.log('current position change -> ', { newPosition })
  const invitationCode = route.params.id
  if (newPosition.latitude && newPosition.longitude && invitationCode) {
    currentPosition.value = newPosition
    invitationStore.fetchInvitationInfo(invitationCode)
  }
})

onMounted(() => {
  console.log('invitation[id].vue -> mounted')
  resume()
})
</script>

<template>
  <div class="page-content-inner">
    <Invitation
      v-if="
        currentPosition?.latitude && currentPosition?.longitude && getInvitationInfo?._id
      "
      :invitation-info="getInvitationInfo"
    />
  </div>
</template>
