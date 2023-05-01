import { defineStore } from 'pinia'
import { useApi } from '../composable/useApi'
import { useCurrentPosition } from './geolocation'

export const useInvitationStore = defineStore('invitations', {
  state: (): any => ({
    invitationInfo: null,
  }),
  getters: {
    getInvitationInfo(state) {
      if (!state.invitationInfo) {
        return null
      }

      const host = (state.invitationInfo?.members ?? []).find(
        (member: any) => member.type === 'HOST'
      )
      return {
        _id: state.invitationInfo._id,
        host: host,
        question: state.invitationInfo.question,
        members: state.invitationInfo?.members ?? [],
        createdBy: state.invitationInfo.createdBy,
        invitationCode: state.invitationInfo.invitationCode,
      }
    },
  },
  actions: {
    async fetchInvitationInfo(invitationCode: string) {
      try {
        const api = useApi()
        const data = await api.get('/invitation-info', { params: { invitationCode } })
        console.log('DATA -> ', data)
        this.invitationInfo = data.data
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },

    async acceptInvitation({
      invitationCode,
      hostId,
    }: {
      invitationCode: string
      hostId: string
    }) {
      try {
        const geoLocation = useCurrentPosition()
        console.log('invitations::acceptInvitation -> ', geoLocation.coords)
        const payload = {
          invitationCode: invitationCode,
          hostId: hostId,
          position: {
            longitude: geoLocation.coords.longitude,
            latitude: geoLocation.coords.latitude,
          },
        }
        const api = useApi()
        const { data } = await api.post('/invitation/accept', payload)
        return data
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
  },
})
