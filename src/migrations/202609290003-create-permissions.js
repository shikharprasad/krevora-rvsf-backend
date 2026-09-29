export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('permissions', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: Sequelize.STRING(150), allowNull: false, unique: true },
    module: { type: Sequelize.STRING(80), allowNull: false },
    action: { type: Sequelize.STRING(80), allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    updated_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addConstraint('permissions', { fields: ['module', 'action'], type: 'unique', name: 'permissions_module_action_unique' })
  await queryInterface.addIndex('permissions', ['module'], { name: 'permissions_module_idx' })
  await queryInterface.addIndex('permissions', ['status'], { name: 'permissions_status_idx' })
  await queryInterface.addIndex('permissions', ['created_by'], { name: 'permissions_created_by_idx' })
  await queryInterface.addIndex('permissions', ['updated_by'], { name: 'permissions_updated_by_idx' })
  await queryInterface.addConstraint('permissions', { fields: ['status'], type: 'check', name: 'permissions_status_check', where: { status: ['ACTIVE', 'INACTIVE'] } })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('permissions')
}
