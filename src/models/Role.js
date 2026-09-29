import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class Role extends Model {}

Role.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_by: { type: DataTypes.BIGINT },
  updated_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'Role', tableName: 'roles', underscored: true })

export default Role
