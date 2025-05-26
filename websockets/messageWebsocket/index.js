import ChatService from '../../service/ChatService.js'
import MessageService from '../../service/ChatService.js'

const rooms = new Map()

export const messageWebsocket = wss => {
  wss.on('connection', ws => {
    ws.on('message', async rawMessage => {
      let parsedMessage

      try {
        parsedMessage = JSON.parse(rawMessage)
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }))
        return
      }

      const { type, roomId, senderId, recipientId, content } = parsedMessage

      switch (type) {
        case 'join': {
          if (!roomId || !senderId || !recipientId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing join parameters' }))
            return
          }

          ws.roomId = roomId
          ws.senderId = senderId
          ws.recipientId = recipientId

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set())
          }

          rooms.get(roomId).add(ws)
          break
        }

        case 'message': {
          if (!roomId || !senderId || !recipientId || !content) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing message parameters' }))
            return
          }

          const message = await ChatService.sendMessage({
            senderId,
            recipientId,
            content
          })

          const payload = {
            type: 'message',
            roomId,
            message
          }

          const clients = rooms.get(roomId)

          if (!clients) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
            return
          }

          // Отправляем сообщение всем участникам комнаты
          for (const client of clients) {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify(payload))
            }
          }

          break
        }

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }))
      }
    })

    ws.on('close', () => {
      const roomId = ws.roomId
      if (roomId && rooms.has(roomId)) {
        const clients = rooms.get(roomId)
        clients.delete(ws)

        if (clients.size === 0) {
          rooms.delete(roomId)
        }
        console.log(`Client left room ${roomId}`)
      }
    })
  })
}
