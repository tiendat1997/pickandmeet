import { defineStore } from 'pinia'
// Import axios to make HTTP requests

export const usePosition = defineStore('position', {
  state: (): any => ({
    longitude: null,
    latitude: null,
    timestamp: null,
  }),
  getters: {
    getPosition: (state) => ({ longitude: state.longitude, latitude: state.latitude }),
  },
  actions: {
    async initGeoLocation() {
      try {
        const _this = this
        await navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Position returned: ', position)
            _this.longitude = position.coords.longitude
            _this.latitude = position.coords.latitude
            _this.timestamp = position.timestamp
          },
          () => {
            console.log('Error: The Geolocation service failed.')
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
          }
        )
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
  },
})
