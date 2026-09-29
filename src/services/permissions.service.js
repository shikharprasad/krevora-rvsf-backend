import { Permission } from '../models/index.js'

export async function listPermissions() {
  return Permission.findAll({
    where: { status: 'ACTIVE' },
    attributes: ['id', 'name', 'module', 'action', 'description', 'status'],
    order: [['module', 'ASC'], ['action', 'ASC']],
  })
}
