import { changePassword, getAuthorizationState, login } from '../services/auth.service.js'

export async function loginController(request, response, next) {
  try {
    const data = await login(request.body.identifier, request.body.password)
    return response.json({ success: true, message: 'Login successful', data })
  } catch (error) {
    return next(error)
  }
}

export async function meController(request, response, next) {
  try {
    const data = await getAuthorizationState(request.user.id)
    return response.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export async function changePasswordController(request, response, next) {
  try {
    await changePassword(request.user.id, request.body.currentPassword, request.body.newPassword)
    return response.json({ success: true, message: 'Password changed successfully', data: null })
  } catch (error) {
    return next(error)
  }
}
