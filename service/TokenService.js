import { TokenModel } from '../models/tokenModel.js'
import jwt from 'jsonwebtoken'

class TokenService {
  generateToken(userId) {
    const accessToken = this._generateAccessToken(userId)
    const refreshToken = this._generateRefreshToken(userId)

    return {
      accessToken,
      refreshToken
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({ user: userId })

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }

    const token = await TokenModel.create({ user: userId, refreshToken })
    return token
  }

  async removeToken(refreshToken) {
    const tokenData = await TokenModel.deleteOne({ refreshToken })

    return tokenData
  }

  async findToken(refreshToken) {
    const tokenData = await TokenModel.findOne({ refreshToken })

    return tokenData
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      return userData
    } catch {
      return null
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

      return userData
    } catch {
      return null
    }
  }

  _generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  }

  _generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
  }
}

export default new TokenService()
