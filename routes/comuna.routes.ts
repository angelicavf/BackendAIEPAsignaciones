import { Request, Response, Router } from "express";
import pool from "../classes/poolConnetion";


const comunaRoutes = Router();





comunaRoutes.get('/', async (req: Request, res: Response) => {


    try {
        const client = await pool.connect();
        const comuna = await client.query(
            `SELECT * FROM "COMUNA";`
        );
        console.log("Consulta Select comuna Ok:")
        client.release();
        return res.json({ comuna });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default comunaRoutes;