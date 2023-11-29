import { Request, Response, Router, request } from "express";
import { connectToDB } from "../classes/dbConnection";
import { QueryResult } from 'pg';

const depositoRoutes = Router();

depositoRoutes.post('/', async (req: Request, res: Response) => {

    const client = await connectToDB();

})

async function insertDeposito(idActividad: number, DEP_MONTO: number, client: any) {


    try {
        //const client = await connectToDB();
        const consulta = `INSERT INTO "DEPOSITO" ("DEP_FECHA", "DEP_MONTO", "DEP_ESTADO", "DEP_ACT_ID", "DEP_ARCHIVO_ADJ") VALUES 
         ($1,$2,$3,$4,$5)RETURNING "DEP_ID";`
        const valores = ['2023-11-20', DEP_MONTO, 'Pendiente', idActividad, 'URL ADJUNTO']; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en deposito:');
        console.log('ID nuevo DEPOSITO:', resultado.rows[0].DEP_ID);

        return (resultado.rows[0].DEP_ID);

    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }
}


async function insertMotivoDeposito(idActividad: number, DEP_MONTO: number, client: any) {

    try {
        //const client = await connectToDB();
        const consulta = `INSERT INTO "DEPOSITO" ("DEP_FECHA", "DEP_MONTO", "DEP_ESTADO", "DEP_ACT_ID", "DEP_ARCHIVO_ADJ") VALUES 
         ($1,$2,$3,$4,$5)RETURNING "DEP_ID";`
        const valores = ['2023-11-20', DEP_MONTO, 'Pendiente', idActividad, 'URL ADJUNTO']; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en deposito:');
        console.log('ID nuevo DEPOSITO:', resultado.rows[0].DEP_ID);

        return (resultado.rows[0].DEP_ID);

    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }
}


export default { depositoRoutes, insertDeposito, insertMotivoDeposito };