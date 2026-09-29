export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('role_permissions', {
    role_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    permission_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'permissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addIndex('role_permissions', ['permission_id'], { name: 'role_permissions_permission_id_idx' })
  await queryInterface.addIndex('role_permissions', ['created_by'], { name: 'role_permissions_created_by_idx' })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('role_permissions')
}
