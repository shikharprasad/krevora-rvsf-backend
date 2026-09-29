import { insertIfMissing } from '../utils/seeder.js'

const roles = [
  ['SUPER_ADMIN', 'Super Admin', 'Protected system administrator role', true],
  ['INVENTORY_MANAGER', 'Inventory Manager', 'Manages inventory access', false],
  ['SALES_EXECUTIVE', 'Sales Executive', 'Manages sales access', false],
  ['ACCOUNTS', 'Accounts', 'Manages account access', false],
  ['WAREHOUSE_STAFF', 'Warehouse Staff', 'Manages warehouse access', false],
  ['REPORTS_VIEWER', 'Reports Viewer', 'Views reporting access', false],
]

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    for (const [key, name, description, isSystem] of roles) {
      await insertIfMissing(queryInterface, 'roles', 'key', key, {
        name,
        key,
        description,
        status: 'ACTIVE',
        is_system: isSystem,
      }, transaction)
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "roles" WHERE "key" IN (:keys)', { replacements: { keys: roles.map(([key]) => key) } })
}
