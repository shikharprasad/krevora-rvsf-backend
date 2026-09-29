import { findByKey, insertIfMissing } from '../utils/seeder.js'

const menus = [
  { key: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', parentKey: null, icon: 'dashboard', displayOrder: 10 },
  { key: 'ADMINISTRATION', name: 'Administration', route: null, parentKey: null, icon: 'settings', displayOrder: 90 },
  { key: 'ADMIN_USERS', name: 'Users', route: '/admin/users', parentKey: 'ADMINISTRATION', icon: 'people', displayOrder: 10 },
  { key: 'ADMIN_ROLES', name: 'Roles', route: '/admin/roles', parentKey: 'ADMINISTRATION', icon: 'security', displayOrder: 20 },
  { key: 'ADMIN_MENUS', name: 'Menus', route: '/admin/menus', parentKey: 'ADMINISTRATION', icon: 'menu', displayOrder: 30 },
]

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    for (const menu of menus) {
      const parent = menu.parentKey
        ? await findByKey(queryInterface, 'menus', 'key', menu.parentKey, transaction)
        : null

      await insertIfMissing(queryInterface, 'menus', 'key', menu.key, {
        name: menu.name,
        key: menu.key,
        parent_id: parent?.id || null,
        route: menu.route,
        icon: menu.icon,
        display_order: menu.displayOrder,
        status: 'ACTIVE',
      }, transaction)
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "menus" WHERE "key" IN (:keys)', { replacements: { keys: menus.map(({ key }) => key) } })
}
