import { createAuth0 } from '@auth0/auth0-vue'
import type { Auth0Plugin } from '@auth0/auth0-vue'

const authConfig: Auth0Plugin = createAuth0({
  domain: 'dev-jp4on1qi7aq802j3.us.auth0.com',
  clientId: 'sepP1337v0FXO1lfHRBJnc7w1IVtwYyR',
  authorizationParams: {
    audience: 'https://auth0-jwt-authorizer',
    redirect_uri: window.location.origin + '/authorize',
  },
})

export default authConfig

export const getAccessToken = async () => {
  const accessToken = await authConfig.getAccessTokenSilently()
  return accessToken
}
