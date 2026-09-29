const permissions = [
  ['dashboard.view', 'dashboard', 'view', 'View the administration dashboard'],
  ['users.view', 'users', 'view', 'View users'],
  ['users.create', 'users', 'create', 'Create users'],
  ['users.update', 'users', 'update', 'Update users'],
  ['users.delete', 'users', 'delete', 'Deactivate users'],
  ['roles.view', 'roles', 'view', 'View roles'],
  ['roles.create', 'roles', 'create', 'Create roles'],
  ['roles.update', 'roles', 'update', 'Update roles'],
  ['roles.delete', 'roles', 'delete', 'Deactivate roles'],
  ['menus.view', 'menus', 'view', 'View menus'],
  ['menus.create', 'menus', 'create', 'Create menus'],
  ['menus.update', 'menus', 'update', 'Update menus'],
]

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    for (const [name, module, action, description] of permissions) {
      await queryInterface.sequelize.query(
        `INSERT INTO "permissions" ("name", "module", "action", "description", "status")
         VALUES (:name, :module, :action, :description, 'ACTIVE')
         ON CONFLICT ("name") DO NOTHING`,
        { replacements: { name, module, action, description }, transaction },
      )
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "permissions" WHERE "name" IN (:names)', { replacements: { names: permissions.map(([name]) => name) } })
}
