<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    questionId: String
    feature: any
    isVote: Boolean
  }>(),
  {}
)

watchPostEffect(() => {
  console.log('VotePopup::onMounted -> ', props)
})
</script>

<template>
  <div>
    <h3>
      <b>{{ feature.properties.placeName }}</b>
    </h3>
    <h4>{{ feature.properties.category }}</h4>
    <h4>{{ feature.properties.count }} Votes</h4>
    <hr />
    <VButton v-if="isVote === true" id="vote-popup-btn-submit" raised color="primary"
      >Vote</VButton
    >
    <VButton v-if="isVote === false" id="vote-popup-btn-submit" raised color="danger"
      >Remove Vote</VButton
    >
  </div>
</template>
