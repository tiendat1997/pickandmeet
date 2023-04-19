import axios, { type RawAxiosRequestHeaders, type AxiosInstance } from 'axios'
import { getAccessToken } from '../authConfig'

let api: AxiosInstance

export function createApi() {
  // Here we set the base URL for all requests made to the api
  api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })
  // We set an interceptor for each request to
  // include Bearer token to the request if user is logged in
  api.interceptors.request.use(async (config) => {
    const accessToken = await getAccessToken()
    config.headers = {
      ...((config.headers as RawAxiosRequestHeaders) ?? {}),
      Authorization: `Bearer ${accessToken}`,
    }

    return config
  })

  return api
}

export function useApi() {
  if (!api) {
    createApi()
  }
  return api
}
