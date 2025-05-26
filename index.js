import 'dotenv/config'

import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'

import router from './router/index.js'
import errorMiddleware from './middlewares/errorMiddleware.js'
import { setupWebSocket } from './websockets/index.js'

const PORT = process.env.PORT || 4000

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use('/api', router)
app.use(errorMiddleware)

const startApp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    setupWebSocket(server)

    server.listen(PORT, () =>
      console.log(`HTTP & WebSocket server running on port ${PORT}`)
    )
  } catch (error) {
    console.error('Error starting the app:', error)
  }
}

startApp()
