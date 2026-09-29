import { Menu } from '../models/index.js'
import { getPagination, paginationResult } from '../utils/pagination.js'
import { httpError } from '../utils/http-error.js'

async function validateParent(menuId, parentId, transaction) {
  if (parentId === null || parentId === undefined) return
  if (String(menuId) === String(parentId)) throw httpError(422, 'A menu cannot be its own parent', 'MENU_CYCLE')

  const visited = new Set()
  let currentId = parentId
  while (currentId) {
    const key = String(currentId)
    if (visited.has(key)) throw httpError(422, 'Circular menu relationship detected', 'MENU_CYCLE')
    visited.add(key)
    if (menuId && key === String(menuId)) throw httpError(422, 'Circular menu relationship detected', 'MENU_CYCLE')
    const parent = await Menu.findByPk(currentId, { transaction, attributes: ['id', 'parent_id'] })
    if (!parent) throw httpError(422, 'Parent menu does not exist', 'INVALID_PARENT_MENU')
    currentId = parent.parent_id
  }
}

export async function listMenus(query) {
  const { page, limit, offset } = getPagination(query)
  const where = query.status ? { status: query.status } : {}
  const result = await Menu.findAndCountAll({ where, order: [['display_order', 'ASC'], ['name', 'ASC']], limit, offset })
  return paginationResult(result.rows, result.count, page, limit)
}

export async function getMenu(id) {
  const menu = await Menu.findByPk(id, { include: [{ model: Menu, as: 'parent', attributes: ['id', 'name', 'key'] }] })
  if (!menu) throw httpError(404, 'Menu not found', 'NOT_FOUND')
  return menu
}

export async function createMenu(payload, actorId) {
  const transaction = await Menu.sequelize.transaction()
  try {
    await validateParent(null, payload.parent_id, transaction)
    const menu = await Menu.create({ ...payload, created_by: actorId, updated_by: actorId, display_order: payload.display_order ?? 0, status: payload.status || 'ACTIVE' }, { transaction })
    await transaction.commit()
    return getMenu(menu.id)
  } catch (error) {
    await transaction.rollback()
    throw error.name === 'SequelizeUniqueConstraintError' ? httpError(409, 'Menu key or route already exists', 'CONFLICT') : error
  }
}

export async function updateMenu(id, payload, actorId) {
  const menu = await Menu.findByPk(id)
  if (!menu) throw httpError(404, 'Menu not found', 'NOT_FOUND')
  const transaction = await Menu.sequelize.transaction()
  try {
    await validateParent(id, payload.parent_id, transaction)
    await menu.update({ ...payload, updated_by: actorId }, { transaction })
    await transaction.commit()
    return getMenu(id)
  } catch (error) {
    await transaction.rollback()
    throw error.name === 'SequelizeUniqueConstraintError' ? httpError(409, 'Menu key or route already exists', 'CONFLICT') : error
  }
}

export async function updateMenuStatus(id, status, actorId) {
  const menu = await Menu.findByPk(id)
  if (!menu) throw httpError(404, 'Menu not found', 'NOT_FOUND')
  if (!['ACTIVE', 'INACTIVE'].includes(status)) throw httpError(422, 'Invalid menu status', 'VALIDATION_ERROR')
  await menu.update({ status, updated_by: actorId })
  return getMenu(id)
}
