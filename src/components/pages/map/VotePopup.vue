<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    questionId: String
    placeName: String
    category: String
    displayAddress: String
    coordinates: Object
    submitVote: Function
    submitRemoveVote: Function
    closePopup: Function
    isVote: Boolean
  }>(),
  {}
)

const isLoading = ref(false)

async function onRemoveVoteClick() {
  let payload = {
    questionId: props.questionId,
    coordinates: props.coordinates,
  }
  isLoading.value = true
  const result = await props.submitRemoveVote(payload)
  console.log('submitRemoveVote result ->', result)
  isLoading.value = false

  if (props.closePopup) {
    props.closePopup()
  }
}

async function onVoteClick() {
  let payload = {
    questionId: props.questionId,
    coordinates: props.coordinates,
    locationMetadata: {
      placeName: props.placeName,
      category: props.category,
      displayAddress: props.displayAddress,
    },
  }
  isLoading.value = true
  const result = await props.submitVote(payload)
  console.log('submitVote result ->', result)
  isLoading.value = false

  if (props.closePopup) {
    props.closePopup()
  }
}
</script>

<template>
  <div>
    <h3>{{ placeName }}</h3>
    <h4>{{ category }}</h4>
    <p>{{ displayAddress }}</p>
    <hr />
    <VButton
      v-if="isVote"
      raised
      color="primary"
      :loading="isLoading"
      @click="onVoteClick()"
      >Vote</VButton
    >
    <VButton
      v-if="!isVote"
      raised
      color="danger"
      :loading="isLoading"
      @click="onRemoveVoteClick()"
      >Remove Vote</VButton
    >
  </div>
</template>
