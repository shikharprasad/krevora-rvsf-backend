import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class Permission extends Model {}

Permission.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  module: { type: DataTypes.STRING(80), allowNull: false },
  action: { type: DataTypes.STRING(80), allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  created_by: { type: DataTypes.BIGINT },
  updated_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'Permission', tableName: 'permissions', underscored: true })

export default Permission
