import { User } from '../models/index.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { httpError } from '../utils/http-error.js'

export async function authenticate(request, _response, next) {
  try {
    const authorization = request.get('authorization')
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null

    if (!token) {
      throw httpError(401, 'Authentication is required', 'UNAUTHORIZED')
    }

    const payload = verifyAccessToken(token)
    const user = await User.findOne({ where: { id: payload.userId, status: 'ACTIVE' } })

    if (!user) {
      throw httpError(401, 'User is inactive or no longer exists', 'UNAUTHORIZED')
    }

    request.user = user
    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(httpError(401, 'Invalid or expired token', 'UNAUTHORIZED'))
    }

    return next(error)
  }
}
