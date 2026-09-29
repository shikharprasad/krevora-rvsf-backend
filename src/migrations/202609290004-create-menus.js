export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('menus', {
    id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: Sequelize.STRING(120), allowNull: false },
    key: { type: Sequelize.STRING(120), allowNull: false, unique: true },
    parent_id: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'menus', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    route: { type: Sequelize.STRING(255), allowNull: true },
    icon: { type: Sequelize.STRING(100), allowNull: true },
    display_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    created_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    updated_by: { type: Sequelize.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
  })

  await queryInterface.sequelize.query('CREATE UNIQUE INDEX menus_route_unique ON menus (route) WHERE route IS NOT NULL')
  await queryInterface.addIndex('menus', ['parent_id'], { name: 'menus_parent_id_idx' })
  await queryInterface.addIndex('menus', ['status', 'parent_id', 'display_order'], { name: 'menus_navigation_idx' })
  await queryInterface.addIndex('menus', ['created_by'], { name: 'menus_created_by_idx' })
  await queryInterface.addIndex('menus', ['updated_by'], { name: 'menus_updated_by_idx' })
  await queryInterface.addConstraint('menus', { fields: ['status'], type: 'check', name: 'menus_status_check', where: { status: ['ACTIVE', 'INACTIVE'] } })
  await queryInterface.addConstraint('menus', { fields: ['display_order'], type: 'check', name: 'menus_display_order_check', where: { display_order: { [Sequelize.Op.gte]: 0 } } })
  await queryInterface.addConstraint('menus', { fields: ['id', 'parent_id'], type: 'check', name: 'menus_parent_not_self_check', where: Sequelize.literal('id <> parent_id OR parent_id IS NULL') })
}

export async function down(queryInterface) {
  await queryInterface.dropTable('menus')
}
