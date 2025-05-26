import ApiError from '../exceptions/ApiError.js'
import ChatService from '../service/ChatService.js'

export default class ChatController {
  async getMessagesByRecipientId(req, res, next) {
    try {
      const { recipientId } = req.params
      const senderId = req.user?.userId

      if (!recipientId) {
        return next(ApiError.BadRequest('Небходимо указать ID получателя'))
      }

      const messages = await ChatService.getMessagesByRecipientId({ senderId, recipientId })

      return res.status(200).json(messages)
    } catch (error) {
      next(error)
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { recipientId } = req.params
      const senderId = req.user?.userId
      const { content } = req.body

      if (!recipientId) {
        return next(ApiError.BadRequest('Небходимо указать ID получателя'))
      }

      if (!content || typeof content !== 'string') {
        return next(ApiError.BadRequest('Небходимо указать текст сообщения'))
      }

      const message = await ChatService.sendMessage({
        senderId,
        recipientId,
        content
      })

      res.status(200).json(message)
    } catch (error) {
      next(error)
    }
  }
}
