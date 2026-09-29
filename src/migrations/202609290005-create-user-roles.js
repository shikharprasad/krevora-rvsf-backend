export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_roles', {
    user_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    role_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addIndex('user_roles', ['role_id'], { name: 'user_roles_role_id_idx' })
  await queryInterface.addIndex('user_roles', ['created_by'], { name: 'user_roles_created_by_idx' })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_roles')
}
