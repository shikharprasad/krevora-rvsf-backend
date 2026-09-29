import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class RolePermission extends Model {}

RolePermission.init({
  role_id: { type: DataTypes.BIGINT, primaryKey: true },
  permission_id: { type: DataTypes.BIGINT, primaryKey: true },
  created_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'RolePermission', tableName: 'role_permissions', underscored: true, timestamps: true, updatedAt: false })

export default RolePermission
