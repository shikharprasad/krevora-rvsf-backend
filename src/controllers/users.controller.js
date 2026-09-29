import { createUser, getUser, listUsers, replaceUserRoles, resetUserPassword, updateUser, updateUserStatus } from '../services/users.service.js'

export async function listUsersController(request, response, next) {
  try { return response.json({ success: true, ...(await listUsers(request.query)) }) } catch (error) { return next(error) }
}
export async function getUserController(request, response, next) {
  try { return response.json({ success: true, data: await getUser(request.params.id) }) } catch (error) { return next(error) }
}
export async function createUserController(request, response, next) {
  try { return response.status(201).json({ success: true, message: 'User created successfully', data: await createUser(request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateUserController(request, response, next) {
  try { return response.json({ success: true, message: 'User updated successfully', data: await updateUser(request.params.id, request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateUserStatusController(request, response, next) {
  try { return response.json({ success: true, message: 'User status updated successfully', data: await updateUserStatus(request.params.id, request.body.status, request.user.id) }) } catch (error) { return next(error) }
}
export async function replaceUserRolesController(request, response, next) {
  try { return response.json({ success: true, message: 'User roles updated successfully', data: await replaceUserRoles(request.params.id, request.body.roleIds, request.user.id) }) } catch (error) { return next(error) }
}
export async function resetUserPasswordController(request, response, next) {
  try { await resetUserPassword(request.params.id, request.body.password, request.user.id); return response.json({ success: true, message: 'User password reset successfully', data: null }) } catch (error) { return next(error) }
}
