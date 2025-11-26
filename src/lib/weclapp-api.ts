import axios from 'axios'

const weclappApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WECLAPP_API_URL,
  headers: {
    'AuthenticationToken': process.env.NEXT_PUBLIC_WECLAPP_API_KEY,
  },
})

export default weclappApi
