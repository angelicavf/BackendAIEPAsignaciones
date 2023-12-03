import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";
import { QueryResult } from 'pg';
import pool from "../classes/poolConnetion";
import jwt from 'jsonwebtoken';


const usuarioRoutes = Router();


usuarioRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
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

        client.release();
    } catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
})

usuarioRoutes.post('/login', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const tokenInfo = await encontrarUsuario(req.body.USR_CORREO, req.body.USR_CONTRASENA);

        if (tokenInfo) {
            res.status(200).json(tokenInfo); // Envía el token al cliente
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

async function encontrarUsuario(correo: any, contrasena: any) {
    try {
        // ... Tu código para buscar el usuario por su nombre y contraseña ...
        const client = await pool.connect();
        const resultado = await client.query(
            `SELECT *
                FROM "USUARIO" WHERE "USR_CORREO"=$1 AND "USR_CONTRASENA" = $2;`,
            [correo, contrasena]);


        if (resultado.rows.length > 0) {
            const usuarioEncontrado = resultado.rows[0];

            // Verifica si la contraseña coincide
            if (usuarioEncontrado.USR_CONTRASENA == contrasena) {
                const status = "ok"
                const token = jwt.sign({ correo: usuarioEncontrado.USR_CORREO }, 'secretoAsignaciones');
                console.log("Login OK")
                console.log(token)
                return { token, status }; // Devuelve el token al cliente
            } else {
                return null; // Contraseña incorrecta
            }
        } else {
            return null; // Usuario no encontrado
        }
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        throw error; // Manejo de errores
    }
}

export default usuarioRoutes;