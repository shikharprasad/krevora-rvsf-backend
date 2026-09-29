import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class UserRole extends Model {}

UserRole.init({
  user_id: { type: DataTypes.BIGINT, primaryKey: true },
  role_id: { type: DataTypes.BIGINT, primaryKey: true },
  created_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'UserRole', tableName: 'user_roles', underscored: true, timestamps: true, updatedAt: false })

export default UserRole
