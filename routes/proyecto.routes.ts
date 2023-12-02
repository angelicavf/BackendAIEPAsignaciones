import { Request, Response, Router } from "express";
import pool from "../classes/poolConnetion";

const proyectoRoutes = Router();

proyectoRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await pool.connect();
        const proyectos = await client.query(
            `SELECT * FROM "PROYECTO";`
        );
        console.log("Consulta Select Proyectos Ok:")

        client.release();
        return res.json({ proyectos });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default proyectoRoutes;