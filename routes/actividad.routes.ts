import { Request, Response, Router } from "express";
const { Client } = require('pg')
import { QueryResult } from 'pg';

import { connectToDB } from "../classes/dbConnection";

const actividadRoutes = Router();

actividadRoutes.post('/', async (req: Request, res: Response) => {
    try {

        const client = await connectToDB();
        const consulta = `INSERT INTO "ACTIVIDAD" ("ACT_NOMBRE", "ACT_DESCRIPCION", "ACT_ESTADO", "ACT_DIRECCION", "ACT_INICIO", "ACT_FIN", "ACT_COM_ID", "ACT_PRO_ID", "ACT_AGE_ID", "ACT_NOMBRE_SOLICITANTE", "ACT_TELEFONO_SOLICITANTE", "ACT_CORREO_SOLICITANTE") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)RETURNING "ACT_ID";`
        const valores = ['REQ_999999', 'Realizar Cambio de Disco Duro y RAM', 'Pendiente', 'Huerfanos 1409', , , 1, 1, 3, 'Carolina Cuevas', '9669111', 'ccuevasp@pjud.cl']; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Actividad:');
        console.log('ID del nuevo registro:', resultado.rows[0].ACT_ID);

        console.log(req.body)
        res.json({
            ok: true,
            resultado: 'post act ok'
        });
    } catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }

})

actividadRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await connectToDB();
        const actividades = await client.query(
            `SELECT * FROM "AGENDA";`
        );
        console.log("Consulta Select Realizada:")
        res.json({ actividades });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default actividadRoutes;

