import { ensureAssignment, findByKey } from '../utils/seeder.js'

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const superAdmin = await findByKey(queryInterface, 'roles', 'key', 'SUPER_ADMIN', transaction)
    const [menus] = await queryInterface.sequelize.query('SELECT "id", "key" FROM "menus" WHERE "status" = \'ACTIVE\'', { transaction })

    for (const menu of menus) {
      await ensureAssignment(queryInterface, 'role_menus', {
        role_id: superAdmin.id,
        menu_id: menu.id,
      }, transaction)
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "role_menus" WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "key" = \'SUPER_ADMIN\')')
}
