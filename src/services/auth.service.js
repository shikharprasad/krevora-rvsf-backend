import { Op } from 'sequelize'
import { Menu, Permission, Role, User } from '../models/index.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import { httpError } from '../utils/http-error.js'

const roleInclude = {
  model: Role,
  as: 'roles',
  attributes: ['id', 'name', 'key', 'status', 'is_system'],
  where: { status: 'ACTIVE' },
  required: false,
  include: [
    {
      model: Permission,
      as: 'permissions',
      attributes: ['id', 'name', 'module', 'action'],
      where: { status: 'ACTIVE' },
      required: false,
      through: { attributes: [] },
    },
    {
      model: Menu,
      as: 'menus',
      attributes: ['id', 'name', 'key', 'parent_id', 'route', 'icon', 'display_order', 'status'],
      where: { status: 'ACTIVE' },
      required: false,
      through: { attributes: [] },
    },
  ],
}

export async function getAuthorizationState(userId) {
  const user = await User.findByPk(userId, {
    include: [roleInclude],
  })

  if (!user) {
    throw httpError(401, 'User is inactive or no longer exists', 'UNAUTHORIZED')
  }

  const roles = user.roles || []
  const permissions = new Map()
  const menus = new Map()

  for (const role of roles) {
    for (const permission of role.permissions || []) {
      permissions.set(permission.name, permission)
    }

    for (const menu of role.menus || []) {
      menus.set(String(menu.id), menu)
    }
  }

  return {
    user: user.toJSON(),
    roles,
    permissions: [...permissions.values()].sort((left, right) => left.name.localeCompare(right.name)),
    menus: [...menus.values()].sort((left, right) => left.display_order - right.display_order),
  }
}

export async function login(identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase()
  const user = await User.unscoped().findOne({
    where: {
      status: 'ACTIVE',
      [Op.or]: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }],
    },
  })

  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw httpError(401, 'Invalid username/email or password', 'INVALID_CREDENTIALS')
  }

  await user.update({ last_login_at: new Date() })

  return {
    token: signAccessToken(user.id),
    ...(await getAuthorizationState(user.id)),
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.unscoped().findByPk(userId)

  if (!user || !(await comparePassword(currentPassword, user.password_hash))) {
    throw httpError(400, 'Current password is incorrect', 'INVALID_PASSWORD')
  }

  await user.update({ password_hash: await hashPassword(newPassword), updated_by: userId })
}
