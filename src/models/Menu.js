import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class Menu extends Model {}

Menu.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  parent_id: { type: DataTypes.BIGINT },
  route: { type: DataTypes.STRING(255) },
  icon: { type: DataTypes.STRING(100) },
  display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  created_by: { type: DataTypes.BIGINT },
  updated_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'Menu', tableName: 'menus', underscored: true })

export default Menu
