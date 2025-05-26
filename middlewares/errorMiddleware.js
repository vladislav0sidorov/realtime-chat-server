import ApiError from '../exceptions/ApiError.js'

export default function errorMiddleware(err, req, res, next) {
  console.error(err)

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    })
  }

  return res.status(500).json({
    status: 500,
    message: 'Непредвиденная серверная ошибка'
  })


}
