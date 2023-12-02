
import { Pool } from 'pg'

const pool = new Pool({
    user: 'administrador',
    host: 'asignacionesdb.postgres.database.azure.com',
    database: 'ASIGNACIONES',
    password: 'Proyecto14122023',
    port: 5432,
    ssl: true,
    max: 20,
    idleTimeoutMillis: 300000,
    connectionTimeoutMillis: 20000,
})

export default pool;