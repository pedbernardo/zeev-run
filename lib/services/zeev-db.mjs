import sql from 'mssql'

export function connect (config) {
  try {
    return sql.connect(config)
  } catch (err) {
    console.error(err)
  }
}

export async function updateOne ({ pool, key, query }) {
  if (!key) return pool.close()

  try {
    return await pool.request().query(query)
  } catch (error) {
    console.error(error)
  } finally {
    pool.close()
  }
}
