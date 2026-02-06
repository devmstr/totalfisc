import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:5015/api', // Matches the .NET API port
  headers: {
    'Content-Type': 'application/json'
  }
})
