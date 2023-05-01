import { defineStore } from 'pinia'
import { useApi } from '../composable/useApi'
import { useCurrentPosition } from './geolocation'

export const useQuestionStore = defineStore('questions', {
  state: () => ({
    questions: [],
  }),
  getters: {
    getQuestions(state) {
      return state.questions
    },
  },
  actions: {
    async fetchQuestions() {
      try {
        const api = useApi()
        const data = await api.get('/questions')
        console.log('DATA -> ', data)
        this.questions = data.data
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
    async addNewQuestion(values: any) {
      try {
        const geoLocation = useCurrentPosition()
        const payload = {
          question: values.questionName,
          position: {
            longitude: geoLocation.coords.longitude,
            latitude: geoLocation.coords.latitude,
          },
          userInfo: values.userInfo,
        }
        const api = useApi()
        const data = await api.post('/questions', payload)
        return data
      } catch (error) {
        alert(error)
        console.log(error)
      }
    },
  },
})
