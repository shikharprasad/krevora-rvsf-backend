import sequelize from '../config/sequelize.js'
import Menu from './Menu.js'
import Permission from './Permission.js'
import Role from './Role.js'
import RoleMenu from './RoleMenu.js'
import RolePermission from './RolePermission.js'
import User from './User.js'
import UserRole from './UserRole.js'

User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' })
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id', as: 'permissions' })
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id', as: 'roles' })
Role.belongsToMany(Menu, { through: RoleMenu, foreignKey: 'role_id', otherKey: 'menu_id', as: 'menus' })
Menu.belongsToMany(Role, { through: RoleMenu, foreignKey: 'menu_id', otherKey: 'role_id', as: 'roles' })
Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'parent' })
Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'children' })
User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
User.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' })
Role.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
Role.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' })
Permission.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
Permission.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' })
Menu.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
Menu.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' })

export { Menu, Permission, Role, RoleMenu, RolePermission, User, UserRole }
export default sequelize
