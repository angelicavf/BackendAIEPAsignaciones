import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";

const proyectoRoutes = Router();

proyectoRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await connectToDB();
        const proyectos = await client.query(
            `SELECT * FROM "PROYECTO";`
        );
        console.log("Consulta Select Proyectos Ok:")

        return res.json({ proyectos });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default proyectoRoutes;