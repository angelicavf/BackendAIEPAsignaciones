import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";
import { QueryResult } from 'pg';

const usuarioRoutes = Router();

usuarioRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const client = await connectToDB();
        const consulta = `INSERT INTO "USUARIO" ("USR_NOMBRES", "USR_AP_PATERNO", "USR_AP_MATERNO", "USR_RUT", "USR_CORREO", "USR_CONTRASENA", "USR_COM_ID", "USR_ROL_ID") VALUES  ($1,$2,$3,$4,$5,$6,$7,$8)RETURNING "AGE_ID";`
        const valores = ['Carlos', 'Rodriguez', 'Perez', '11111111-1', 'crodiguez@example.com', 'contraseña_22', 1, 2]; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Usuario:');
        console.log('ID del nuevo registro:', resultado.rows[0].USR_ID);

        console.log(req.body)
        res.json({
            ok: true,
            resultado: 'post usuario ok'
        });
    } catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
})

export default usuarioRoutes;