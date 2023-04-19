<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect } = useAuth0()

const handleLogin = () => {
  loginWithRedirect({
    appState: {
      target: '/app',
    },
  })
}
</script>

<template>
  <VButton rounded raised @click="handleLogin">
    <strong>Log In</strong>
  </VButton>
</template>
