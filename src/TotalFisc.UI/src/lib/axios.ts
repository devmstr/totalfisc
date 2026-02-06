import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Default for MVP
  headers: {
    'Content-Type': 'application/json'
  }
})
