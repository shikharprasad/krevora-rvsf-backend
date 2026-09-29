export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('roles', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: Sequelize.STRING(100), allowNull: false },
    key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
    is_system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    updated_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addIndex('roles', ['status'], { name: 'roles_status_idx' })
  await queryInterface.addIndex('roles', ['created_by'], { name: 'roles_created_by_idx' })
  await queryInterface.addIndex('roles', ['updated_by'], { name: 'roles_updated_by_idx' })
  await queryInterface.addConstraint('roles', { fields: ['status'], type: 'check', name: 'roles_status_check', where: { status: ['ACTIVE', 'INACTIVE'] } })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('roles')
}
