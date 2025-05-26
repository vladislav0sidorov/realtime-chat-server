import { Mongoose } from 'mongoose'
import UserDto from '../dtos/UserDto.js'
import ApiError from '../exceptions/ApiError.js'
import { UserModel } from '../models/userModel.js'
import MailService from './MailService.js'
import TokenService from './TokenService.js'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'

class UserService {
  async register(email, password) {
    const candidate = await UserModel.findOne({ email })

    if (candidate) {
      throw ApiError.BadRequest('Пользователь с таким email уже существует')
    }

    const hashPassword = await bcrypt.hash(password, 5)
    const activationLink = v4()

    const user = await UserModel.create({ email, password: hashPassword, activationLink })

    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    return await this._generateAndSaveTokensForUser(user)
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })

    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации')
    }

    user.isActivated = true
    await user.save()
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)

    if (!isPassEquals) {
      throw ApiError.BadRequest('Указан неверный пароль')
    }

    return await this._generateAndSaveTokensForUser(user)
  }

  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken)

    return token
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = TokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await TokenService.findToken(refreshToken)

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }
    const user = await UserModel.findById(userData.userId)

    if (!user) {
      throw ApiError.UnauthorizedError()
    }

    return await this._generateAndSaveTokensForUser(user)
  }

  async getAllUsers(currentUserId) {
    const users = await UserModel.find({ _id: { $ne: currentUserId } })

    return users
  }

  async _generateAndSaveTokensForUser(user) {
    const userDto = new UserDto(user)
    const tokens = TokenService.generateToken(userDto.id)
    await TokenService.saveToken(userDto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: userDto
    }
  }
}

export default new UserService()
