import { acceptHMRUpdate, defineStore } from 'pinia'
import AWS from 'aws-sdk'
import AWSIoTData from 'aws-iot-device-sdk'
import { useRoomStore } from './useRoom'

export const useIoT = defineStore('iot', () => {
  const roomKey = ref<string | null>()
  const isConnected = ref<boolean>(false)
  const mqttClient = shallowRef<any>()
  const roomStore = useRoomStore()

  const AWS_CONFIGURATION = {
    poolId: import.meta.env.VITE_POOL_ID as string, //'us-east-1:e4803d3b-42d5-496f-9c5a-408f20eb28e4', // 'YourCognitoIdentityPoolId'
    host: import.meta.env.VITE_HOST as string, // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
    region: import.meta.env.VITE_REGION as string, // 'YourAwsRegion', e.g. 'us-east-1'
  }

  function initialize() {
    console.log('useIoT::initialize -> ')
    AWS.config.region = AWS_CONFIGURATION.region
    initializeCredentials()
  }

  function onGetCredentialSucceed(data: any) {
    console.log('useIoT::onGetCredentialSucceed')
    let errorCount = 0
    const clientId = 'askAroundMe-' + Math.floor(Math.random() * 100000 + 1)

    console.log('IoT created', {
      region: AWS.config.region,
      host: AWS_CONFIGURATION.host,
      clientId: clientId,
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: false,
      accessKeyId: '',
      secretKey: '',
      sessionToken: '',
    })

    mqttClient.value = new AWSIoTData.device({
      region: AWS.config.region,
      host: AWS_CONFIGURATION.host,
      clientId: clientId,
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: false,
      accessKeyId: data.Credentials.AccessKeyId,
      secretKey: data.Credentials.SecretKey,
      sessionToken: data.Credentials.SessionToken,
    })

    mqttClient.value.on('error', function (err: any) {
      console.log('ERROR: ', err)
      if (errorCount > 0) {
        console.log('mqttClient error:', err)
      }
      errorCount++
    })

    mqttClient.value.on('connect', function () {
      console.log('mqttClient connected -> ')
      isConnected.value = true
      // subscribe();
    })

    mqttClient.value.on('disconnect', function () {
      console.log('mqttClient disconnect -> ', roomKey.value)
    })

    mqttClient.value.on('message', function (topic: any, payload: any) {
      console.log('TOPIC: ', { topic, payload })
      const msg = JSON.parse(payload.toString())
      console.log('IoT msg: ', topic, msg)
      if (topic === roomKey.value) {
        // add new comer;
        if (msg.title === 'new-comer') {
          console.log('FOUND NEW COMER', msg)
          if (msg.member) {
            // _store.commit('addRealTimeMember', msg.member)
          }
        } else if (msg.title === 'new-vote') {
          console.log('FOUND NEW VOTE', msg)
          if (msg.vote) {
            roomStore.addVote(msg.vote)
          }
        } else if (msg.title === 'removed-vote') {
          console.log('REMOVE VOTE', msg)
          if (msg.vote) {
            roomStore.removeVote(msg.vote)
          }
        }
      }
    })
  }

  function initializeCredentials() {
    const cognitoIdentity = new AWS.CognitoIdentity()
    const credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_CONFIGURATION.poolId,
    })
    credentials.get((err: any) => {
      if (!err) {
        console.log('retrieved identity: ' + credentials.identityId)
        const params = {
          IdentityId: credentials.identityId,
        }
        cognitoIdentity.getCredentialsForIdentity(params, function (err: any, data: any) {
          if (!err) {
            onGetCredentialSucceed(data)
          } else {
            // console.log('error retrieving credentials: ' + err)
          }
        })
      } else {
        // console.log('error retrieving identity:' + err)
      }
    })
  }

  function subscribe(rangeKey: string) {
    console.log('useIoT::subscribe -> ', rangeKey)
    if (!mqttClient.value || !isConnected.value || !rangeKey) {
      return
    }
    console.log('IoT subcribing to ', rangeKey)
    roomKey.value = rangeKey
    mqttClient.value.subscribe(rangeKey)
  }

  function unsubscribe(rangeKey: string) {
    console.log('useIoT::unsubscribe -> ', rangeKey)
    if (!mqttClient.value || !isConnected.value || !rangeKey) {
      return
    }

    console.log('IoT unsubcribing to ', rangeKey)
    roomKey.value = null
    mqttClient.value.unsubscribe(roomKey)
  }

  return {
    roomKey,
    isConnected,
    initialize,
    subscribe,
    unsubscribe,
  } as const
})
/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIoT, import.meta.hot))
}
