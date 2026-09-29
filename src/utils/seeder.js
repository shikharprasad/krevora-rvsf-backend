import { QueryTypes } from 'sequelize'

const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`

export async function findByKey(queryInterface, table, keyColumn, keyValue, transaction) {
  const [record] = await queryInterface.sequelize.query(
    `SELECT * FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier(keyColumn)} = :keyValue LIMIT 1`,
    { replacements: { keyValue }, type: QueryTypes.SELECT, transaction },
  )
  return record || null
}

export async function insertIfMissing(queryInterface, table, uniqueColumn, uniqueValue, values, transaction) {
  const columns = Object.keys(values)
  const replacements = {}
  const columnSql = columns.map(quoteIdentifier).join(', ')
  const valueSql = columns.map((column, index) => {
    const replacement = `value${index}`
    replacements[replacement] = values[column]
    return `:${replacement}`
  }).join(', ')

  await queryInterface.sequelize.query(
    `INSERT INTO ${quoteIdentifier(table)} (${columnSql}) VALUES (${valueSql}) ON CONFLICT (${quoteIdentifier(uniqueColumn)}) DO NOTHING`,
    { replacements, transaction },
  )

  return findByKey(queryInterface, table, uniqueColumn, uniqueValue, transaction)
}

export async function ensureAssignment(queryInterface, table, values, transaction) {
  const columns = Object.keys(values)
  const replacements = {}
  const columnSql = columns.map(quoteIdentifier).join(', ')
  const valueSql = columns.map((column, index) => {
    const replacement = `value${index}`
    replacements[replacement] = values[column]
    return `:${replacement}`
  }).join(', ')

  await queryInterface.sequelize.query(
    `INSERT INTO ${quoteIdentifier(table)} (${columnSql}) VALUES (${valueSql}) ON CONFLICT DO NOTHING`,
    { replacements, transaction },
  )
}
