import { validationResult } from 'express-validator'
import UserService from '../service/UserService.js'
import ApiError from '../exceptions/ApiError.js'
import UserDto from '../dtos/UserDto.js'

const DAYS_30 = 30 * 24 * 60 * 60 * 1000

export default class UserController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при регистрации', errors.array()))
      }

      const { email, password } = req.body

      const userData = await UserService.register(email, password)

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: DAYS_30,
        httpOnly: true
      })
      res.json(userData)
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await UserService.login(email, password)

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: DAYS_30,
        httpOnly: true
      })
      res.json(userData)
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await UserService.logout(refreshToken)
      res.clearCookie('refreshToken')

      return res.status(200).json(token)
    } catch (error) {
      next(error)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await UserService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await UserService.refresh(refreshToken)

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: DAYS_30,
        httpOnly: true
      })
      res.json(userData)
    } catch (error) {
      next(error)
    }
  }

  async getUsers(req, res, next) {
    try {
      const currentUserId = req.user.userId
      const users = await UserService.getAllUsers(currentUserId)
      const usersDto = users.map(user => new UserDto(user))

      return res.json(usersDto)
    } catch (error) {
      next(error)
    }
  }
}
