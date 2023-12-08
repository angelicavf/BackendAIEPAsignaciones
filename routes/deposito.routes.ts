import { Request, Response, Router, request } from "express";
import { connectToDB } from "../classes/dbConnection";
import { QueryResult } from 'pg';

const depositoRoutes = Router();


async function insertDeposito(idActividad: number, DEP_MONTO: number, client: any): Promise<number> {


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


async function insertMotivoDeposito(MOT_ID: number, DM_MOT_ID: Number[], client: any) {

    try {
        // const client = await connectToDB();
        for (const idmotivo of DM_MOT_ID) {
            const consulta = `INSERT INTO "DEPOSITO_MOTIVO" ("DEM_MOT_ID", "DEM_DEP_ID")VALUES ($1, $2);`
            const valores = [idmotivo, MOT_ID]; // Valores para la inserción
            console.log(idmotivo)

            const resultado: QueryResult = await client.query(consulta, valores);
        }
        console.log('Registro insertado con éxito en motivo_deposito:');


    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }
}



export default { depositoRoutes, insertDeposito, insertMotivoDeposito };