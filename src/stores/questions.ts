import { defineStore } from 'pinia'
// Import axios to make HTTP requests

import { useApi } from '../composable/useApi'
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
  },
})
