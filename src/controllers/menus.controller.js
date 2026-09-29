import { createMenu, getMenu, listMenus, updateMenu, updateMenuStatus } from '../services/menus.service.js'

export async function listMenusController(request, response, next) {
  try { return response.json({ success: true, ...(await listMenus(request.query)) }) } catch (error) { return next(error) }
}
export async function getMenuController(request, response, next) {
  try { return response.json({ success: true, data: await getMenu(request.params.id) }) } catch (error) { return next(error) }
}
export async function createMenuController(request, response, next) {
  try { return response.status(201).json({ success: true, message: 'Menu created successfully', data: await createMenu(request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateMenuController(request, response, next) {
  try { return response.json({ success: true, message: 'Menu updated successfully', data: await updateMenu(request.params.id, request.body, request.user.id) }) } catch (error) { return next(error) }
}
export async function updateMenuStatusController(request, response, next) {
  try { return response.json({ success: true, message: 'Menu status updated successfully', data: await updateMenuStatus(request.params.id, request.body.status, request.user.id) }) } catch (error) { return next(error) }
}
