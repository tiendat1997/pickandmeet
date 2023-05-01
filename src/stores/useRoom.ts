import { defineStore } from 'pinia'
// Import axios to make HTTP requests

import { useApi } from '../composable/useApi'
import axios from 'axios'
export const useRoomStore = defineStore('room', {
  state: (): any => ({
    members: {},
    votes: {},
    question: null,
    rangeKey: null,
    questionId: null,
    nearByLocations: null,
  }),
  getters: {
    getQuestionId(state) {
      return state.questionId
    },
    getMembers(state) {
      return Object.values(state.members ?? {}) ?? []
    },
    getRoomDetail(state) {
      return {
        members: state.members,
        questionId: state.questionId,
        votes: state.votes,
        question: state.question,
        rangeKey: state.rangeKey,
      }
    },
    getVotes(state) {
      return Object.values(state.votes ?? {}) ?? []
    },
    getLocations(state) {
      const features = (state.nearByLocations?.features ?? []).map((item: any) => {
        return {
          type: 'Feature',
          properties: {
            name: 'Fast Pizza',
            logo: '/images/icons/logos/fastpizza.svg',
            distance: 0.3,
            openingCount: '6pm',
            phone: '+1 555 456-5659',
            website: 'https://huro.cssninja.io',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Memini me adesse meam.',
            ...item.properties,
          },
          geometry: item.geometry,
        }
      })
      const locations = {
        type: 'FeatureCollection',
        features: features,
      }

      return locations
    },
    getFeatures(state) {
      const existingVotes = state.getVotes
      const normalizeFeatures =
        state.nearByLocations?.features?.map((item: any) => {
          const longitude = item.geometry.coordinates[0]
          const latitude = item.geometry.coordinates[1]
          const foundVoteIndex = existingVotes.findIndex(
            (vote: any) => vote.longitude === longitude && vote.latitude === latitude
          )
          let foundVote
          if (foundVoteIndex > -1) {
            foundVote = existingVotes[foundVoteIndex]
            existingVotes.splice(foundVoteIndex, 1)
          }

          return {
            ...item,
            count: foundVote ? foundVote.count : undefined,
            userIds: foundVote ? foundVote.userIds : undefined,
            userList: foundVote ? foundVote.userList : undefined,
            coordinates: item.geometry.coordinates,
            properties: {
              ...item.properties,
              placeName: item.text,
              displayAddress: item.properties.address,
            },
          }
        }) ?? []

      if (existingVotes.length > 0) {
        existingVotes.forEach((vote: any) => {
          normalizeFeatures.push({
            ...vote,
          })
        })
      }

      return normalizeFeatures ?? []
    },
  },
  actions: {
    async joinRoom(rangeKey: string, position: { latitude: number; longitude: number }) {
      try {
        const api = useApi()
        const url = `/questions/join?rangeKey=${rangeKey}&lat=${position.latitude}&lng=${position.longitude}`

        console.log('URL: ', url)
        const { data } = await api.post(url)
        console.log('Result: ', data)
        this.question = data.question
        this.rangeKey = data.rangeKey
        this.questionId = data._id

        // init members
        console.log('init members -> ', data.members)
        if ((data.members ?? []).length) {
          data.members.forEach((member: any) => {
            this.members = {
              ...this.members,
              [member.uid]: {
                ...member,
              },
            }
          })
        }

        // init votes
        if ((data.votes ?? []).length) {
          data.votes.forEach((vote: any) => {
            const coordinates = vote.coordinates
            const key = String(coordinates[0]) + '_' + String(coordinates[1])
            const userIds = vote.userIds ?? []
            const userList = vote.userList ?? []

            this.votes = {
              [key]: {
                count: vote.count,
                latitude: vote.latitude,
                longitude: vote.longitude,
                properties: vote.properties,
                coordinates: coordinates,
                userIds,
                userList,
              },
            }
          })
        }
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
    async fetchNearByLocations(centerPosition: { latitude: number; longitude: number }) {
      const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string

      // const bbox = `${bounds._sw.lng},${bounds._sw.lat},${bounds._ne.lng},${bounds._ne.lat}`; // TODO: Not working with bbox
      const proximity = `${centerPosition.longitude},${centerPosition.latitude}`
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/coffee.json?proximity=${proximity}&access_token=${accessToken}&limit=100`
      console.log('Getting nearby location -> URL: ', url)
      const { data } = await axios.get(url)
      console.log('NearBy result: ', data)

      this.nearByLocations = data
    },
    async submitVote(voteData: {
      questionId: string
      coordinates: number[]
      locationMetadata: {
        placeName: string
        category: string
        displayAddress: string
      }
      userInfo: any
    }) {
      // Build payload for star/geo type questions
      const payload = {
        questionId: voteData.questionId,
        coordinates: voteData.coordinates,
        locationMetadata: voteData.locationMetadata,
        userInfo: voteData.userInfo,
      }

      try {
        const api = useApi()
        const url = `/votes`

        console.log('URL: ', url)
        const { data } = await api.post(url, payload)
        console.log('Result: ', data)
        // handle success
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
    async submitRemoveVote(voteData: { questionId: string; coordinates: number[] }) {
      const payload = {
        questionId: voteData.questionId,
        coordinates: voteData.coordinates,
      }

      try {
        const api = useApi()
        const url = `/votes`

        console.log('URL: ', url)
        const { data } = await api.delete(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
          data: payload,
        })
        console.log('Result: ', data)
        // handle success
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
    removeVote(vote: any) {
      console.log('useRoom:removeVote -> ')
      const coordinates = vote.coordinates
      const key = String(coordinates[0]) + '_' + String(coordinates[1])
      const userIds = (this.votes[key].userIds ?? []).filter(
        (uid: any) => uid !== vote.uid
      )
      const userList = (this.votes[key].userList ?? []).filter(
        (user: any) => user.sub !== vote.uid
      )

      this.votes = {
        ...this.votes,
        [key]: {
          ...this.votes[key],
          coordinates: coordinates,
          count: userIds.length,
          userIds,
          userList,
        },
      }
    },
    addVote(vote: any) {
      console.log('useRoom::addVote -> ', vote)
      if (!vote) {
        return null
      }
      const coordinates = vote.geoJson.coordinates
      const key = String(coordinates[0]) + '_' + String(coordinates[1])
      const userIds = [...(this.votes[key]?.userIds ?? [])]
      const userList = [...(this.votes[key]?.userList ?? [])]
      userIds.push(vote.uid)
      userList.push(vote.userInfo)

      this.votes = {
        ...this.votes,
        [key]: {
          ...this.votes[key],
          coordinates: coordinates,
          longitude: coordinates[0],
          latitude: coordinates[1],
          count: (this.votes[key]?.count ?? 0) + 1,
          properties: vote.locationMetadata,
          userIds: userIds,
          userList: userList,
        },
      }
    },
    addMember(member: any) {
      console.log('store::addRealTimeMember')
      const coordinates = member.geoJson.coordinates
      const key =
        String(member.uid) + '_' + String(coordinates[0]) + '_' + String(coordinates[1])
      this.members = {
        ...this.members,
        [key]: member,
      }
    },
  },
})
