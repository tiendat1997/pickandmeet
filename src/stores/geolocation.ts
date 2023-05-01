import { acceptHMRUpdate, defineStore } from 'pinia'
export const useCurrentPosition = defineStore('currentPosition', () => {
  const coords = ref<any>({})
  const loadingPosition = ref<Boolean>(true)

  const fetchCurrentPosition = () => {
    console.log('[useCurrentPosition]::fetchCurrentPosition ->')
    loadingPosition.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadingPosition.value = false
        coords.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      },
      (error) => {
        loadingPosition.value = false
        console.error(error)
        alert(error.message)
      }
    )
  }

  return {
    coords,
    loadingPosition,
    fetchCurrentPosition,
  } as const
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentPosition, import.meta.hot))
}
