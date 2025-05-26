import { MessageModel } from '../models/messageModel.js'
import MessageDto from '../dtos/MessageDto.js'

class ChatService {
  async getMessagesByRecipientId({ recipientId, senderId }) {
    const messages = await MessageModel.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'email')
      .populate('recipient', 'email')

    const messageDtos = messages.map(message => new MessageDto(message))

    return messageDtos
  }

  async sendMessage({ senderId, recipientId, content }) {
    const message = new MessageModel({
      sender: senderId,
      recipient: recipientId,
      content
    })

    await message.save()

    const messageDto = new MessageDto(message)

    return messageDto
  }
}

export default new ChatService()
