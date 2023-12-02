import { Request, Response, Router } from "express";
import pool from "../classes/poolConnetion";

const motivoroutes = Router();

motivoroutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await pool.connect();
        const motivo = await client.query(
            `SELECT * FROM "MOTIVO";`
        );
        console.log("Consulta Select motivo Ok:")

        client.release();
        return res.json({ motivo });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default motivoroutes;