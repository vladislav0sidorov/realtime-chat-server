export default class MessageDto {
  content
  sender
  recipient
  createdAt
  read

  constructor(model) {
    this.content = model.content
    this.sender = model.sender._id
    this.recipient = model.recipient._id
    this.createdAt = model.createdAt
    this.read = model.read
  }
}
