import { listPermissions } from '../services/permissions.service.js'

export async function listPermissionsController(request, response, next) {
  try { return response.json({ success: true, data: await listPermissions() }) } catch (error) { return next(error) }
}
