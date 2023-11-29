import { Client } from 'pg';

const connectionData = {
    user: 'administrador',
    host: 'asignacionesdb.postgres.database.azure.com',
    database: 'ASIGNACIONES',
    password: 'Proyecto14122023',
    port: 5432,
    ssl: true,
};

const client = new Client(connectionData);


export async function connectToDB() {
    try {
        await client.connect();

        console.log('Conexión exitosa a la base de datos');
        return client;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
}

export default client;