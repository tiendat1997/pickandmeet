<script setup lang="ts">
import { useIoT } from '/@src/stores/useIoT'

const iotStore = useIoT()

const props = defineProps<{
  roomDetail: any
  currentPosition: any
}>()

onBeforeMount(() => {
  console.log('onBeforeMount: IoT -> ', {
    position: props.currentPosition,
    roomDetail: props.roomDetail,
  })
  if (props.currentPosition) {
    iotStore.initialize()
  }
})

watch(
  () => iotStore.isConnected,
  (first, second) => {
    console.log('Watch iotStore.isConnected function called with args:', first, second)
    if (props.roomDetail?.rangeKey) {
      iotStore.subscribe(props.roomDetail?.rangeKey)
    }
  }
)

onMounted(() => {
  console.log('onMounted: IoT -> ', {
    position: props.currentPosition,
    roomDetail: props.roomDetail,
  })
})

onUnmounted(() => {
  console.log('onUnMounted: IoT -> ', {
    position: props.currentPosition,
    roomDetail: props.roomDetail,
  })

  if (props.roomDetail?.rangeKey) {
    iotStore.unsubscribe(props.roomDetail?.rangeKey)
  }
})
</script>

<template>
  <div></div>
</template>
