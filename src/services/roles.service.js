import { Menu, Permission, Role, RoleMenu, RolePermission } from '../models/index.js'
import { getPagination, paginationResult } from '../utils/pagination.js'
import { httpError } from '../utils/http-error.js'

const permissionInclude = { model: Permission, as: 'permissions', attributes: ['id', 'name', 'module', 'action'], through: { attributes: [] } }
const menuInclude = { model: Menu, as: 'menus', attributes: ['id', 'name', 'key', 'parent_id', 'route', 'icon', 'display_order', 'status'], through: { attributes: [] } }

export async function listRoles(query) {
  const { page, limit, offset } = getPagination(query)
  const result = await Role.findAndCountAll({ where: query.status ? { status: query.status } : {}, order: [['name', 'ASC']], limit, offset })
  return paginationResult(result.rows, result.count, page, limit)
}

export async function getRole(id) {
  const role = await Role.findByPk(id, { include: [permissionInclude, menuInclude] })
  if (!role) throw httpError(404, 'Role not found', 'NOT_FOUND')
  return role
}

function normalizeRole(payload) {
  return { ...payload, key: payload.key?.trim().toUpperCase() }
}

export async function createRole(payload, actorId) {
  const data = normalizeRole(payload)
  try {
    const role = await Role.create({ name: data.name, key: data.key, description: data.description, status: data.status || 'ACTIVE', created_by: actorId, updated_by: actorId })
    return getRole(role.id)
  } catch (error) {
    throw error.name === 'SequelizeUniqueConstraintError' ? httpError(409, 'Role key already exists', 'CONFLICT') : error
  }
}

export async function updateRole(id, payload, actorId) {
  const role = await Role.findByPk(id)
  if (!role) throw httpError(404, 'Role not found', 'NOT_FOUND')
  if (role.is_system && payload.key && payload.key.toUpperCase() !== role.key) throw httpError(400, 'System role keys are immutable', 'SYSTEM_ROLE_PROTECTION')
  const data = normalizeRole(payload)
  try {
    await role.update({ name: data.name, key: role.is_system ? role.key : data.key, description: data.description, updated_by: actorId })
    return getRole(id)
  } catch (error) {
    throw error.name === 'SequelizeUniqueConstraintError' ? httpError(409, 'Role key already exists', 'CONFLICT') : error
  }
}

export async function updateRoleStatus(id, status, actorId) {
  const role = await Role.findByPk(id)
  if (!role) throw httpError(404, 'Role not found', 'NOT_FOUND')
  if (role.is_system) throw httpError(400, 'System roles cannot be deactivated', 'SYSTEM_ROLE_PROTECTION')
  if (!['ACTIVE', 'INACTIVE'].includes(status)) throw httpError(422, 'Invalid role status', 'VALIDATION_ERROR')
  await role.update({ status, updated_by: actorId })
  return getRole(id)
}

async function replaceAssignment(model, foreignKey, roleId, ids, actorId) {
  const transaction = await Role.sequelize.transaction()
  try {
    const role = await Role.findByPk(roleId, { transaction })
    if (!role) throw httpError(404, 'Role not found', 'NOT_FOUND')
    if (role.is_system) throw httpError(400, 'Super Admin assignments cannot be changed', 'SYSTEM_ROLE_PROTECTION')
    const uniqueIds = [...new Set((ids || []).map(Number))]
    const records = uniqueIds.length ? await model.findAll({ where: { id: uniqueIds, status: 'ACTIVE' }, transaction }) : []
    if (records.length !== uniqueIds.length) throw httpError(422, 'One or more assignments are invalid or inactive', 'INVALID_ASSIGNMENT')
    const through = model === Permission ? RolePermission : RoleMenu
    const targetKey = model === Permission ? 'permission_id' : 'menu_id'
    await through.destroy({ where: { role_id: roleId }, transaction })
    if (records.length) await through.bulkCreate(records.map((record) => ({ role_id: roleId, [targetKey]: record.id, created_by: actorId })), { transaction })
    await transaction.commit()
    return getRole(roleId)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export function replaceRolePermissions(roleId, permissionIds, actorId) {
  return replaceAssignment(Permission, 'permission_id', roleId, permissionIds, actorId)
}

export function replaceRoleMenus(roleId, menuIds, actorId) {
  return replaceAssignment(Menu, 'menu_id', roleId, menuIds, actorId)
}
