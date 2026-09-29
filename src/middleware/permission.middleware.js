import { getAuthorizationState } from '../services/auth.service.js'
import { httpError } from '../utils/http-error.js'

export function authorize(permissionName) {
  return async (request, _response, next) => {
    try {
      if (!request.user) {
        throw httpError(401, 'Authentication is required', 'UNAUTHORIZED')
      }

      const authorization = await getAuthorizationState(request.user.id)
      const isSuperAdmin = authorization.roles.some((role) => role.key === 'SUPER_ADMIN')
      const hasPermission = authorization.permissions.some((permission) => permission.name === permissionName)

      if (!isSuperAdmin && !hasPermission) {
        throw httpError(403, 'You do not have permission to perform this action', 'FORBIDDEN')
      }

      request.authorization = authorization
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
