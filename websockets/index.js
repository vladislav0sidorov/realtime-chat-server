import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { messageWebsocket } from './messageWebsocket/index.js'

export const setupWebSocket = server => {
  const wss = new WebSocketServer({ server })

  messageWebsocket(wss)

  console.log('WebSocket server attached to HTTP server')
}
