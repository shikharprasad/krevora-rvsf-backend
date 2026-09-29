import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/sequelize.js'

class User extends Model {}

User.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  mobile: { type: DataTypes.STRING(30) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  last_login_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.BIGINT },
  updated_by: { type: DataTypes.BIGINT },
}, { sequelize, modelName: 'User', tableName: 'users', underscored: true, defaultScope: { attributes: { exclude: ['password_hash'] } }, scopes: { withPassword: { attributes: {} } } })

export default User
