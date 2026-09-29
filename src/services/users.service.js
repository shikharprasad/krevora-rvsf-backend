import { Op } from 'sequelize'
import { Role, User, UserRole } from '../models/index.js'
import { getPagination, paginationResult } from '../utils/pagination.js'
import { hashPassword } from '../utils/password.js'
import { httpError } from '../utils/http-error.js'

const roleInclude = { model: Role, as: 'roles', attributes: ['id', 'name', 'key', 'status', 'is_system'], through: { attributes: [] } }

function normalizeUserPayload(payload) {
  return {
    ...payload,
    username: payload.username?.trim().toLowerCase(),
    email: payload.email?.trim().toLowerCase(),
  }
}

async function validateRoleIds(roleIds, transaction) {
  const uniqueRoleIds = [...new Set((roleIds || []).map(Number))]
  if (!uniqueRoleIds.length) return []

  const roles = await Role.findAll({ where: { id: uniqueRoleIds, status: 'ACTIVE' }, transaction })
  if (roles.length !== uniqueRoleIds.length) {
    throw httpError(422, 'One or more role IDs are invalid or inactive', 'INVALID_ROLE_ASSIGNMENT')
  }

  return roles
}

export async function listUsers(query) {
  const { page, limit, offset } = getPagination(query)
  const where = {}
  if (query.status) where.status = query.status
  if (query.search) {
    const search = `%${query.search.trim()}%`
    where[Op.or] = [{ full_name: { [Op.iLike]: search } }, { username: { [Op.iLike]: search } }, { email: { [Op.iLike]: search } }]
  }

  const result = await User.findAndCountAll({
    where,
    include: [roleInclude],
    attributes: { exclude: ['password_hash'] },
    distinct: true,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return paginationResult(result.rows, result.count, page, limit)
}

export async function getUser(id) {
  const user = await User.findByPk(id, { include: [roleInclude], attributes: { exclude: ['password_hash'] } })
  if (!user) throw httpError(404, 'User not found', 'NOT_FOUND')
  return user
}

export async function createUser(payload, actorId) {
  const data = normalizeUserPayload(payload)
  const transaction = await User.sequelize.transaction()

  try {
    const roles = await validateRoleIds(data.roleIds, transaction)
    const user = await User.create({
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      mobile: data.mobile,
      password_hash: await hashPassword(data.password),
      status: data.status || 'ACTIVE',
      created_by: actorId,
      updated_by: actorId,
    }, { transaction })

    if (roles.length) {
      await UserRole.bulkCreate(roles.map((role) => ({ user_id: user.id, role_id: role.id, created_by: actorId })), { transaction })
    }

    await transaction.commit()
    return getUser(user.id)
  } catch (error) {
    await transaction.rollback()
    throw error.name === 'SequelizeUniqueConstraintError'
      ? httpError(409, 'Username or email already exists', 'CONFLICT')
      : error
  }
}

export async function updateUser(id, payload, actorId) {
  const user = await User.unscoped().findByPk(id)
  if (!user) throw httpError(404, 'User not found', 'NOT_FOUND')
  const data = normalizeUserPayload(payload)
  const transaction = await User.sequelize.transaction()

  try {
    await validateRoleIds(data.roleIds, transaction)
    await user.update({ full_name: data.full_name, username: data.username, email: data.email, mobile: data.mobile, updated_by: actorId }, { transaction })
    if (data.roleIds) await replaceUserRoles(user.id, data.roleIds, actorId, transaction)
    await transaction.commit()
    return getUser(id)
  } catch (error) {
    await transaction.rollback()
    throw error.name === 'SequelizeUniqueConstraintError'
      ? httpError(409, 'Username or email already exists', 'CONFLICT')
      : error
  }
}

export async function updateUserStatus(id, status, actorId) {
  const user = await User.findByPk(id, { include: [roleInclude] })
  if (!user) throw httpError(404, 'User not found', 'NOT_FOUND')
  if (!['ACTIVE', 'INACTIVE'].includes(status)) throw httpError(422, 'Invalid user status', 'VALIDATION_ERROR')

  if (status === 'INACTIVE' && user.roles.some((role) => role.key === 'SUPER_ADMIN')) {
    const activeSuperAdmins = await User.count({ where: { status: 'ACTIVE' }, include: [{ model: Role, as: 'roles', where: { key: 'SUPER_ADMIN' }, required: true, through: { attributes: [] } }], distinct: true })
    if (activeSuperAdmins <= 1) throw httpError(400, 'The last active Super Admin cannot be deactivated', 'SUPER_ADMIN_PROTECTION')
  }

  await user.update({ status, updated_by: actorId })
  return getUser(id)
}

export async function replaceUserRoles(id, roleIds, actorId, existingTransaction = null) {
  const transaction = existingTransaction || await User.sequelize.transaction()
  try {
    const user = await User.unscoped().findByPk(id, { transaction })
    if (!user) throw httpError(404, 'User not found', 'NOT_FOUND')
    const roles = await validateRoleIds(roleIds, transaction)
    await UserRole.destroy({ where: { user_id: id }, transaction })
    if (roles.length) await UserRole.bulkCreate(roles.map((role) => ({ user_id: id, role_id: role.id, created_by: actorId })), { transaction })
    if (!existingTransaction) await transaction.commit()
    return getUser(id)
  } catch (error) {
    if (!existingTransaction) await transaction.rollback()
    throw error
  }
}

export async function resetUserPassword(id, password, actorId) {
  const user = await User.unscoped().findByPk(id)
  if (!user) throw httpError(404, 'User not found', 'NOT_FOUND')
  await user.update({ password_hash: await hashPassword(password), updated_by: actorId })
}
