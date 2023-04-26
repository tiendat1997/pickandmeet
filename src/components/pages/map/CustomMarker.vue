<template>
  <div class="marker-content">
    <img src="/@src/assets/cafe-icon.png" alt="location-icon-img" />
    <VTag v-if="!!count" color="solid"
      >{{ count }} vote<span v-if="count > 1">s</span></VTag
    >
  </div>
</template>

<script lang="ts">
export default {
  name: 'MarkerContent',
  props: {
    count: Number,
  },
  mounted() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.marker-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}
</style>
