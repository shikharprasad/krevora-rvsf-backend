export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    full_name: { type: Sequelize.STRING(150), allowNull: false },
    username: { type: Sequelize.STRING(80), allowNull: false, unique: true },
    email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    mobile: { type: Sequelize.STRING(30), allowNull: true },
    password_hash: { type: Sequelize.STRING(255), allowNull: false },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
    last_login_at: { type: Sequelize.DATE, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    updated_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.addIndex('users', ['status'], { name: 'users_status_idx' })
  await queryInterface.addIndex('users', ['created_by'], { name: 'users_created_by_idx' })
  await queryInterface.addIndex('users', ['updated_by'], { name: 'users_updated_by_idx' })
  await queryInterface.addConstraint('users', { fields: ['status'], type: 'check', name: 'users_status_check', where: { status: ['ACTIVE', 'INACTIVE'] } })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users')
}
