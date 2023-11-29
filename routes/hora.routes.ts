import { Request, Response, Router } from "express";
import { connectToDB } from "../classes/dbConnection";

const horaRoutes = Router();

horaRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await connectToDB();
        const hora = await client.query(
            `SELECT * FROM "HORA";`
        );
        console.log("Consulta Select hora Ok:")

        return res.json({ hora });

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

async function obtenerHorasDisponibles(): Promise<number[]> {
    try {
        const client = await connectToDB(); // Obtener conexión a la base de datos

        const consulta = `SELECT "HOR_ID" FROM "HORA"`; // Consulta para obtener los id de las horas
        const resultado = await client.query(consulta);

        const horasDisponibles: number[] = resultado.rows.map((row: any) => row.id);

        await client.end(); // Cerrar conexión con la base de datos

        return horasDisponibles;
    } catch (error) {
        console.error('Error al obtener las horas disponibles:', error);
        throw new Error('Error al obtener las horas disponibles');
    }
}

export default horaRoutes;