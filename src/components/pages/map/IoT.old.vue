<template>
  <div></div>
</template>

<script lang="ts">
let mqttClient: any

export default {
  name: 'IoT',
  props: {
    roomDetail: Object,
    currentPosition: Object,
  },
  mounted() {
    console.log('COMPONENT IOT mounted: ')
    // if (this.roomKey) {
    //   this.subscribe()
    // }
  },
  created() {
    console.log('COMPONENT IOT created: ', {
      roomDetail: this.roomDetail,
      currentPosition: this.currentPosition,
    })
    if (this.roomDetail?.rangeKey) {
      this.mountIOT()
    }
  },
  beforeUnmount() {
    console.log('COMPONENT IOT beforeDestroy: ')
    // if (this.roomKey) {
    //   this.unsubscribe()
    // }
  },

  methods: {
    subscribe() {
      const roomKey = this.roomDetail?.rangeKey
      if (roomKey) {
        console.log('IoT subcribing to ', roomKey)
        mqttClient.subscribe(roomKey)
      } else {
        console.log('NO ROOM KEY FOUND')
      }
    },
    unsubscribe() {
      const roomKey = this.roomDetail?.rangeKey
      if (roomKey) {
        console.log('IoT unsubcribing to ', roomKey)
        mqttClient.unsubscribe(roomKey)
      } else {
        console.log('NO ROOM KEY FOUND')
      }
    },
    getCreds() {
      Promise.all([import('aws-sdk').then((m) => m.default)]).then(([AWS]: [any]) => {
        const cognitoIdentity = new AWS.CognitoIdentity()
        AWS.config.credentials.get(function (err: any, data: any) {
          if (!err) {
            console.log('retrieved identity: ' + AWS.config.credentials.identityId, data)
            const params = {
              IdentityId: AWS.config.credentials.identityId,
            }
            cognitoIdentity.getCredentialsForIdentity(
              params,
              function (err: any, data: any) {
                if (!err) {
                  mqttClient.updateWebSocketCredentials(
                    data.Credentials.AccessKeyId,
                    data.Credentials.SecretKey,
                    data.Credentials.SessionToken
                  )
                } else {
                  // console.log('error retrieving credentials: ' + err)
                }
              }
            )
          } else {
            // console.log('error retrieving identity:' + err)
          }
        })
      })
    },
    mountIOT() {
      Promise.all([
        import('aws-sdk').then((m) => m.default),
        import('aws-iot-device-sdk').then((m) => m.default),
      ]).then(([AWS, AWSIoTData]) => {
        let errorCount = 0
        const _roomKey = this.roomDetail?.rangeKey
        const AWSConfiguration = {
          poolId: import.meta.env.VITE_POOL_ID as string, //'us-east-1:e4803d3b-42d5-496f-9c5a-408f20eb28e4', // 'YourCognitoIdentityPoolId'
          host: import.meta.env.VITE_HOST as string, // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
          region: import.meta.env.VITE_REGION as string, // 'YourAwsRegion', e.g. 'us-east-1'
        }

        console.log('CONFIGURATION AWS', AWSConfiguration)

        var clientId = 'askAroundMe-' + Math.floor(Math.random() * 100000 + 1)
        AWS.config.region = AWSConfiguration.region

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: AWSConfiguration.poolId,
        })

        console.log('IoT created', {
          region: AWS.config.region,
          host: AWSConfiguration.host,
          clientId: clientId,
          protocol: 'wss',
          maximumReconnectTimeMs: 8000,
          debug: false,
          accessKeyId: '',
          secretKey: '',
          sessionToken: '',
        })

        mqttClient = new AWSIoTData.device({
          region: AWS.config.region,
          host: AWSConfiguration.host,
          clientId: clientId,
          protocol: 'wss',
          maximumReconnectTimeMs: 8000,
          debug: false,
          accessKeyId: '',
          secretKey: '',
          sessionToken: '',
        })

        const _this = this

        mqttClient.on('connect', function () {
          console.log('mqttClient connected -> ', _roomKey)
          mqttClient.subscribe(_roomKey)
        })

        mqttClient.on('disconnect', function () {
          console.log('mqttClient disconnect -> ', _roomKey)
        })

        mqttClient.on('error', function (err: any) {
          console.log('ERROR: ', err)
          if (errorCount > 0) {
            console.log('mqttClient error:', err)
          }
          errorCount++
          _this.getCreds()
        })

        mqttClient.on('message', function (topic: any, payload: any) {
          console.log('TOPIC: ', { topic, payload })
          const msg = JSON.parse(payload.toString())
          console.log('IoT msg: ', topic, msg)
          if (topic === _roomKey) {
            // add new comer;
            if (msg.title === 'new-comer') {
              console.log('FOUND NEW COMER', msg)
              if (msg.member) {
                // _store.commit('addRealTimeMember', msg.member)
              }
            } else if (msg.title === 'new-vote') {
              console.log('FOUND NEW VOTE', msg)
              if (msg.vote) {
                // _store.commit('addRealTimeVote', msg.vote)
              }
            } else if (msg.title === 'removed-vote') {
              console.log('REMOVE VOTE', msg)
              if (msg.vote) {
                // _store.commit('removeRealTimeVote', msg.vote)
              }
            }
          }
        })

        _this.getCreds()
      })
    },
  },
}
</script>
