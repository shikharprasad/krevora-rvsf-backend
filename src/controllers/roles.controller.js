import { createRole, getRole, listRoles, replaceRoleMenus, replaceRolePermissions, updateRole, updateRoleStatus } from '../services/roles.service.js'

export async function listRolesController(request, response, next) {
  try { return response.json({ success: true, ...(await listRoles(request.query)) }) } catch (error) { return next(error) }
}
export async function getRoleController(request, response, next) {
  try { return response.json({ success: true, data: await getRole(request.params.id) }) } catch (error) { return next(error) }
}
export async function createRoleController(request, response, next) {
  try { return response.status(201).json({ success: true, message: 'Role created successfully', data: await createRole(request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateRoleController(request, response, next) {
  try { return response.json({ success: true, message: 'Role updated successfully', data: await updateRole(request.params.id, request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateRoleStatusController(request, response, next) {
  try { return response.json({ success: true, message: 'Role status updated successfully', data: await updateRoleStatus(request.params.id, request.body.status, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateRolePermissionsController(request, response, next) {
  try { return response.json({ success: true, message: 'Role permissions updated successfully', data: await replaceRolePermissions(request.params.id, request.body.permissionIds, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateRoleMenusController(request, response, next) {
  try { return response.json({ success: true, message: 'Role menus updated successfully', data: await replaceRoleMenus(request.params.id, request.body.menuIds, request.user.id) }) } catch (error) { return next(error) }
}
export async function getRolePermissionsController(request, response, next) {
  try { const role = await getRole(request.params.id); return response.json({ success: true, data: role.permissions || [] }) } catch (error) { return next(error) }
}
export async function getRoleMenusController(request, response, next) {
  try { const role = await getRole(request.params.id); return response.json({ success: true, data: role.menus || [] }) } catch (error) { return next(error) }
}
