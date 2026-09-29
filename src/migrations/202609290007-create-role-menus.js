export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('role_menus', {
    role_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    menu_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'menus', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addIndex('role_menus', ['menu_id'], { name: 'role_menus_menu_id_idx' })
  await queryInterface.addIndex('role_menus', ['created_by'], { name: 'role_menus_created_by_idx' })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('role_menus')
}
