<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useInvitationStore } from '/@src/stores/invitations'

const props = defineProps<{
  coords: any
}>()

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Invitation')
const invitationStore = useInvitationStore()
const route: any = useRoute()

useHead({
  title: 'Invitation - My app',
})

const invitationInfo = computed(() => {
  return invitationStore.getInvitationInfo
})

watchPostEffect(() => {
  console.log('watchPostEffect -> ', props.coords)
  const invitationCode = route.params.id
  if (
    invitationCode &&
    props.coords.longitude !== Infinity &&
    props.coords.latitude !== Infinity
  ) {
    console.log('current position change -> ', { coords: props.coords })
    alert(
      `current position change -> ${JSON.stringify({
        longitude: props.coords.longitude,
        latitude: props.coords.latitude,
      })}`
    )
    invitationStore.fetchInvitationInfo(invitationCode)
  }
})

onMounted(() => {
  console.log('invitation[id].vue -> mounted')
})
</script>

<template>
  <div class="page-content-inner">
    <Invitation
      v-if="!!invitationInfo && !!invitationInfo._id"
      :invitation-info="invitationInfo"
    />
  </div>
</template>
