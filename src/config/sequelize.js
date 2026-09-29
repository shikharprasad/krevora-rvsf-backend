import { Sequelize } from 'sequelize'
import env from './env.js'
import databaseConfig from './database.js'

const sequelize = new Sequelize(databaseConfig[env.nodeEnv] || databaseConfig.development)

export default sequelize
