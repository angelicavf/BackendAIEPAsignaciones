"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'administrador',
    host: 'asignacionesdb.postgres.database.azure.com',
    database: 'ASIGNACIONES',
    password: 'Proyecto14122023',
    port: 5432,
    ssl: true,
    max: 20,
    idleTimeoutMillis: 300000,
    connectionTimeoutMillis: 20000,
});
exports.default = pool;
