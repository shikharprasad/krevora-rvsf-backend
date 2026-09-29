import bcrypt from 'bcryptjs'
import { ensureAssignment, findByKey, insertIfMissing } from '../utils/seeder.js'

function requireBootstrapValue(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required to seed the Super Admin user`)
  }

  return value
}

export async function up(queryInterface) {
  const name = requireBootstrapValue('SUPER_ADMIN_NAME')
  const email = requireBootstrapValue('SUPER_ADMIN_EMAIL').trim().toLowerCase()
  const password = requireBootstrapValue('SUPER_ADMIN_PASSWORD')
  const username = email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 80) || 'admin'
  const passwordHash = await bcrypt.hash(password, 12)
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const user = await findByKey(queryInterface, 'users', 'email', email, transaction)
      || await insertIfMissing(queryInterface, 'users', 'username', username, {
        full_name: name,
        username,
        email,
        password_hash: passwordHash,
        status: 'ACTIVE',
      }, transaction)

    await queryInterface.sequelize.query(
      'UPDATE "users" SET "full_name" = :name, "status" = \'ACTIVE\' WHERE "id" = :id',
      { replacements: { name, id: user.id }, transaction },
    )

    const superAdmin = await findByKey(queryInterface, 'roles', 'key', 'SUPER_ADMIN', transaction)
    await ensureAssignment(queryInterface, 'user_roles', {
      user_id: user.id,
      role_id: superAdmin.id,
    }, transaction)

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query('DELETE FROM "users" WHERE "email" = :email', { replacements: { email: process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || '' } })
}
