import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";
import { QueryResult } from 'pg';

const agendaRoutes = Router();


agendaRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const client = await connectToDB();
        const consulta = `INSERT INTO "AGENDA" ("AGE_FECHA", "AGE_ESTADO", "AGE_USR_ID") VALUES ($1,$2,$3)RETURNING "AGE_ID";`
        const valores = ['2023-11-16', 'Disponible', '4']; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Agenda:');
        console.log('ID del nuevo registro:', resultado.rows[0].AGE_ID);

        console.log(req.body)
        res.json({
            ok: true,
            resultado: 'post agenda ok'
        });
    } catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
})

export default agendaRoutes;