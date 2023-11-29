import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";

const comunaRoutes = Router();

comunaRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await connectToDB();
        const comuna = await client.query(
            `SELECT * FROM "COMUNA";`
        );
        console.log("Consulta Select comuna Ok:")

        return res.json({ comuna });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

export default comunaRoutes;