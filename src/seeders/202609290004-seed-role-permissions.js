import { ensureAssignment, findByKey } from '../utils/seeder.js'

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const superAdmin = await findByKey(queryInterface, 'roles', 'key', 'SUPER_ADMIN', transaction)
    const inventoryManager = await findByKey(queryInterface, 'roles', 'key', 'INVENTORY_MANAGER', transaction)
    const [permissions] = await queryInterface.sequelize.query('SELECT "id", "name" FROM "permissions" WHERE "status" = \'ACTIVE\'', { transaction })

    for (const permission of permissions) {
      await ensureAssignment(queryInterface, 'role_permissions', {
        role_id: superAdmin.id,
        permission_id: permission.id,
      }, transaction)
    }

    for (const permissionName of ['users.view', 'users.create']) {
      const permission = await findByKey(queryInterface, 'permissions', 'name', permissionName, transaction)
      await ensureAssignment(queryInterface, 'role_permissions', {
        role_id: inventoryManager.id,
        permission_id: permission.id,
      }, transaction)
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "role_permissions" WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "key" = \'SUPER_ADMIN\')')
  await queryInterface.sequelize.query('DELETE FROM "role_permissions" WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "key" = \'INVENTORY_MANAGER\')')
}
