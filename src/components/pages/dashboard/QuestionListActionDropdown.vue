<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    item: any
  }>(),
  {
    item: {},
  }
)
</script>
<template>
  <VDropdown icon="feather:more-vertical" spaced right>
    <template #content>
      <a
        role="menuitem"
        :href="`/map/${props.item?.rangeKey}`"
        class="dropdown-item is-media"
      >
        <div class="icon">
          <i aria-hidden="true" class="lnil lnil-enter"></i>
        </div>
        <div class="meta">
          <span>Join</span>
          <span>Go details</span>
        </div>
      </a>

      <!-- <a role="menuitem" href="#" class="dropdown-item is-media">
        <div class="icon">
          <i aria-hidden="true" class="lnil lnil-bubble"></i>
        </div>
        <div class="meta">
          <span>Message</span>
          <span>Send Message</span>
        </div>
      </a>

      <a role="menuitem" href="#" class="dropdown-item is-media">
        <div class="icon">
          <i aria-hidden="true" class="lnil lnil-travel"></i>
        </div>
        <div class="meta">
          <span>Transfer</span>
          <span>Transfer to other list</span>
        </div>
      </a> -->

      <hr class="dropdown-divider" />

      <a role="menuitem" href="#" class="dropdown-item is-media">
        <div class="icon">
          <i aria-hidden="true" class="lnil lnil-trash"></i>
        </div>
        <div class="meta">
          <span>Remove</span>
          <span>Remove from list</span>
        </div>
      </a>
    </template>
  </VDropdown>
</template>
