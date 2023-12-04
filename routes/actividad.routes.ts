import { Request, Response, Router } from "express";
const { Client } = require('pg')
import { QueryResult } from 'pg';
import * as nodemailer from 'nodemailer';
import { connectToDB } from "../classes/dbConnection";
import depositoRoutes from "./deposito.routes";
import horaRoutes from "./hora.routes";
import pool from "../classes/poolConnetion";

const actividadRoutes = Router();

//configuracion de google para envio de mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asignaciones.aliadotech@gmail.com',
        pass: 'syhrljfgyhnpmaod',
    },
});


actividadRoutes.post('/', async (req: Request, res: Response) => {

    const client = await pool.connect();
    insertAgenda(req, client).then((idAgenda: Number) => {
        console.log(req.body.AH_HOR_ID)
        agendaHora(idAgenda, client, req.body.AH_HOR_ID)

        insertActividad(req, idAgenda, client).then(idActividad => {

            const enviarDeposito = { idAct: idActividad, DEP_MONTO: req.body.DEP_MONTO };

            depositoRoutes.insertDeposito(idActividad, req.body.DEP_MONTO, client).then(idDeposito => {

                depositoRoutes.insertMotivoDeposito(idDeposito, req.body.DEM_MOT_ID, client)

                client.release();
                res.json("ok");
            })
        })
    })
})


actividadRoutes.get('/', async (req: Request, res: Response) => {

    try {
        const client = await connectToDB();
        const actividad = await client.query(
            `SELECT USR."USR_NOMBRES", USR."USR_AP_PATERNO", COM."COM_NOMBRE"
            FROM "USUARIO" USR, "COMUNA" COM
                WHERE USR."USR_COM_ID"= COM."COM_ID"`
        );
        console.log("Consulta Select Realizada:")
        res.json({ actividad });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

async function insertAgenda(req: Request, client: any) {

    try {
        //const client = await connectToDB();
        const consulta = `INSERT INTO "AGENDA" ("AGE_FECHA", "AGE_ESTADO", "AGE_USR_ID") VALUES ($1,$2,$3)RETURNING "AGE_ID";`
        const valores = [req.body.AGE_FECHA, "Asignada", req.body.AGE_USR_ID]; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Agenda:');
        console.log('ID nueva AGENDA:', resultado.rows[0].AGE_ID);


        return (resultado.rows[0].AGE_ID);

    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }

}

async function insertActividad(req: Request, AGE_ID: Number, client: any) {
    try {
        // const client = await connectToDB();
        const consulta = `INSERT INTO "ACTIVIDAD" ("ACT_NOMBRE", "ACT_DESCRIPCION", "ACT_ESTADO", "ACT_DIRECCION", "ACT_COM_ID", "ACT_PRO_ID", "ACT_AGE_ID", "ACT_NOMBRE_SOLICITANTE", "ACT_TELEFONO_SOLICITANTE", "ACT_CORREO_SOLICITANTE") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10)RETURNING "ACT_ID";`
        const valores = [req.body.ACT_NOMBRE, req.body.ACT_DESCRIPCION, "Pendiente", req.body.ACT_DIRECCION, req.body.ACT_COM_ID, req.body.ACT_PRO_ID, AGE_ID, req.body.ACT_NOMBRE_SOLICITANTE, req.body.ACT_TELEFONO_SOLICITANTE, req.body.ACT_CORREO_SOLICITANTE]; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Actividad:');
        console.log('ID nueva ACTIVIDAD:', resultado.rows[0].ACT_ID);


        const queryCom = await client.query(
            `SELECT "COM_NOMBRE"
                FROM "COMUNA" WHERE "COM_ID"=$1;`,
            [req.body.ACT_COM_ID]);

        const queryusr = await client.query(
            `SELECT "USR_CORREO", "USR_NOMBRES", "USR_AP_PATERNO"
                    FROM "USUARIO" WHERE "USR_ID"=$1;`,
            [req.body.AGE_USR_ID]);

        const USR_Correo = queryusr.rows[0]?.USR_CORREO;
        const USR_NOMBRES = queryusr.rows[0]?.USR_NOMBRES;
        const USR_AP_PATERNO = queryusr.rows[0]?.USR_AP_PATERNO;
        const COMUNA = queryCom.rows[0]?.COM_NOMBRE;

        const AH_HOR_ID = req.body.AH_HOR_ID; // Este es un array: [6, 7, 8] por ejemplo


        const primerElemento = AH_HOR_ID[0]; // Acceder al primer elemento
        const ultimoElemento = AH_HOR_ID[AH_HOR_ID.length - 1];

        const resultadoInicio = await client.query(
            `SELECT "HOR_VALOR" FROM "HORA" WHERE "HOR_ID" =$1;`,
            [primerElemento]);
        const resultadoFin = await client.query(
            `SELECT "HOR_VALOR" FROM "HORA" WHERE "HOR_ID" =$1;`,
            [ultimoElemento]);

        const horainicio = resultadoInicio.rows[0]?.HOR_VALOR;
        const horafin = resultadoFin.rows[0]?.HOR_VALOR;


        const info = transporter.sendMail({
            from: 'asignaciones.aliadotech@gmail.com',
            to: USR_Correo,
            subject: `Coordinación de Visita - Caso ${req.body.ACT_NOMBRE}`,
            html: `
            <p>Estimado ${USR_NOMBRES} ${USR_AP_PATERNO},</p>
            <p>Se informa del área de coordinación, que cuenta con una visita programada para atencion de requerimiento ${req.body.ACT_NOMBRE}</p>
            <br>
            <p><b>👤Usuario Solicitante:<b></p>
            <p>${req.body.ACT_NOMBRE_SOLICITANTE}</p>
            <p><b>📝Contacto del solicitante:<b></p>
            <p>📞 teléfono ${req.body.ACT_TELEFONO_SOLICITANTE}, 📧 correo ${req.body.ACT_CORREO_SOLICITANTE} </p>
            <p><b>📍Dirección:<b></p>           
            <p>${req.body.ACT_DIRECCION} - Comuna ${COMUNA} </p>
            <p><b>🧰Descripción de Actividad:<b></p>
            <p>${req.body.ACT_DESCRIPCION}</p>
            <p><b>⏰ Horario De Actividad:<b></p>
            <p>Inicio: ${horainicio} horas</p>
            <p>Fin: ${horafin} horas</p>
            <br>
            <p>Recuerda ser puntual, informar incidencias y registrar tus actividades segun los procedimientos establecidos.</p>
            <br>
            <p>Atte,</p>
            <p><b>Aliado Tech<b><p>
            <small>El aliado de tu solución tecnológica<small>`,
        });



        return (resultado.rows[0].ACT_ID);

    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }
}

async function agendaHora(AGE_ID: any, client: any, AH_HOR_ID: Number[]) {

    try {
        // const client = await connectToDB();

        for (const idhora of AH_HOR_ID) {
            const consulta = `INSERT INTO "AGENDA_HORA" ("AH_AGE_ID", "AH_HOR_ID")VALUES ($1, $2);`
            const valores = [AGE_ID, idhora]; // Valores para la inserción
            console.log(idhora)

            const resultado: QueryResult = await client.query(consulta, valores);
        }
        console.log('Registro insertado con éxito en agenda hora:');


    } catch (error) {
        console.error('Error al insertar registro:', error);
        return -1;
    }

}

actividadRoutes.post('/iniciar', async (req: Request, res: Response) => {
    try {
        const client = await connectToDB();
        const ACT_ID = req.body.ACT_ID;
        const finicio = await client.query(
            `UPDATE "ACTIVIDAD"
             SET "ACT_INICIO"=CURRENT_TIMESTAMP
             WHERE "ACT_ID"=$1;`,
            [ACT_ID]
        );

        const estInicio = await client.query(
            `UPDATE "ACTIVIDAD"
                    SET "ACT_ESTADO"=$1
                    WHERE "ACT_ID"=$2;`,
            ["Iniciada", ACT_ID]
        );


        console.log(ACT_ID)
        console.log("Cambio de estado Inicio con fecha actual :")


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

actividadRoutes.post('/finalizar', async (req: Request, res: Response) => {
    try {
        const client = await connectToDB();
        const ACT_ID = req.body.ACT_ID;
        const finicio = await client.query(
            `UPDATE "ACTIVIDAD"
             SET "ACT_FIN"=CURRENT_TIMESTAMP
             WHERE "ACT_ID"=$1;`,
            [ACT_ID]
        );

        const estInicio = await client.query(
            `UPDATE "ACTIVIDAD"
                    SET "ACT_ESTADO"=$1
                    WHERE "ACT_ID"=$2;`,
            ["Finalizada", ACT_ID]
        );

        //query para obtener los dayos de correo, desscripcion y nmbre de actividad
        //para enviar un correo automatico al finalizar la actividad
        const queryResult = await client.query(
            `SELECT "ACT_CORREO_SOLICITANTE","ACT_DESCRIPCION" ,"ACT_NOMBRE"
                FROM "ACTIVIDAD" WHERE "ACT_ID"=$1;`,
            [ACT_ID]);

        const USR_Correo = queryResult.rows[0]?.ACT_CORREO_SOLICITANTE;
        const ACT_DESCRIPCION = queryResult.rows[0]?.ACT_DESCRIPCION;
        const ACT_NOMBRE = queryResult.rows[0]?.ACT_NOMBRE;

        console.log(queryResult)


        const info = transporter.sendMail({
            from: 'asignaciones.aliadotech@gmail.com',
            to: USR_Correo,
            subject: `Evaluación de Visita Programada - Caso ${ACT_NOMBRE}`,
            html: `
            <p>Estimado usuario,</p>
            <p>De acuerdo a la atención efectuada en terreno el día de hoy, se comparte enlace para realizar evaluación de atención.</p>
            <p>Enlace: </p>
            <br>
            <p>¡Tu valoración es importante para la mejora continua de nuestros servicios!</p>
            <br>
            <p>Atte,</p>
            <p><b>Aliado Tech<b></p>
            <small>El aliado de tu solución tecnológica<small>`,
        });

        console.log(USR_Correo)
        console.log(ACT_ID)
        console.log("Cambio de estado finalizada con fecha actual :")



    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})


export default actividadRoutes;

