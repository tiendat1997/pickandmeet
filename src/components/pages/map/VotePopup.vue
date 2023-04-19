<template>
  <div>
    <h3>{{ placeName }}</h3>
    <h4>{{ category }}</h4>
    <p>{{ displayAddress }}</p>

    <button v-if="isVote" @click="submitVote()">Vote</button>

    <button v-if="!isVote" @click="removeVote()">Remove Vote</button>
  </div>
</template>

<script lang="ts">
import { useRoomStore } from '/@src/stores/useRoom'
import { useAuth0 } from '@auth0/auth0-vue'

export default {
  name: 'VotePopup',
  props: {
    questionId: String,
    userId: String,
    placeName: String,
    category: String,
    displayAddress: String,
    coordinates: Object,
    closePopup: Function,
    isVote: Boolean,
  },
  mounted() {
    // Vote POPUP ON MOUNTED
  },
  methods: {
    async removeVote() {
      const roomStore = useRoomStore()
      let payload = {
        questionId: this.questionId,
        coordinates: this.coordinates,
      }
      await roomStore.submitRemoveVote(payload)
      if (this.closePopup) {
        this.closePopup()
      }
    },
    async submitVote() {
      // Build payload for star/geo type questions
      const { user } = useAuth0()
      let payload = {
        questionId: this.questionId,
        coordinates: this.coordinates,
        locationMetadata: {
          placeName: this.placeName,
          category: this.category,
          displayAddress: this.displayAddress,
        },
        userInfo: user,
      }

      const roomStore = useRoomStore()
      await roomStore.submitVote(payload)
      if (this.closePopup) {
        this.closePopup()
      }
    },
  },
}
</script>
