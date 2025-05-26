import ApiError from '../exceptions/ApiError.js'
import TokenService from '../service/TokenService.js'

export default function (req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next(ApiError.UnauthorizedError())
    }

    const accessToken = authHeader.split(' ')[1]

    if (!accessToken) {
      return next(ApiError.UnauthorizedError())
    }

    const userData = TokenService.validateAccessToken(accessToken)

    if (!userData) {
      return next(ApiError.UnauthorizedError())
    }

    req.user = userData
    next()
  } catch {
    return next(ApiError.UnauthorizedError())
  }
}
