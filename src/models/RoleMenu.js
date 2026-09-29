import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class RoleMenu extends Model {}

RoleMenu.init({
  role_id: { type: DataTypes.BIGINT, primaryKey: true },
  menu_id: { type: DataTypes.BIGINT, primaryKey: true },
  created_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'RoleMenu', tableName: 'role_menus', underscored: true, timestamps: true, updatedAt: false })

export default RoleMenu
