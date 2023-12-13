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





actividadRoutes.post('/lista', async (req: Request, res: Response) => {

    console.log(req.body.AGE_FECHA)
    try {
        const client = await pool.connect();
        const actividad = await client.query(
            `select h.*, R."REG_NOMBRE", "COM_NOMBRE"
            from (SELECT coalesce(U2."USR_ID", p."USR_ID")                 as "USR_ID",
                         coalesce((U2."USR_NOMBRES" || ' ' || U2."USR_AP_PATERNO"), p."USR_NOMBRES") as "USR_NOMBRES",
                         coalesce(U2."USR_COM_ID", p."USR_COM_ID")         as "USR_COM_ID",
                         json_agg(p.*)                                     as actividades
                  FROM "USUARIO" U2
                           LEFT JOIN (SELECT U."USR_ID",
                                             U."USR_AP_PATERNO",
                                             U."USR_COM_ID",
                                             "AGE_FECHA",
                                             U."USR_NOMBRES",
                                             A."ACT_ESTADO",
                                             A."ACT_NOMBRE",
                                             A."ACT_ID",
                                             json_agg(H."HOR_VALOR") as HORAS
                                      FROM "AGENDA"
                                               LEFT JOIN public."ACTIVIDAD" A on "AGENDA"."AGE_ID" = A."ACT_AGE_ID"
                                               LEFT JOIN public."USUARIO" U on U."USR_ID" = "AGENDA"."AGE_USR_ID"
                                               LEFT JOIN public."AGENDA_HORA" AH on "AGENDA"."AGE_ID" = AH."AH_AGE_ID"
                                               LEFT JOIN public."HORA" H on AH."AH_HOR_ID" = H."HOR_ID"
                                      WHERE "AGE_FECHA" = $1
                                      GROUP BY U."USR_ID", U."USR_AP_PATERNO", U."USR_COM_ID", "AGE_FECHA", U."USR_NOMBRES",
                                               A."ACT_ESTADO", A."ACT_NOMBRE", A."ACT_ID") as p
                                     on U2."USR_ID" = p."USR_ID"
                  group by coalesce(U2."USR_ID", p."USR_ID"), coalesce((U2."USR_NOMBRES" || ' ' || U2."USR_AP_PATERNO"), p."USR_NOMBRES"),
                           coalesce(U2."USR_AP_PATERNO", p."USR_AP_PATERNO"), coalesce(U2."USR_COM_ID", p."USR_COM_ID")) as h
            left join "COMUNA" on "COM_ID" = "USR_COM_ID"
            left join public."REGION" R on R."REG_ID" = "COMUNA"."COM_REG_ID"
           `,
            [req.body.AGE_FECHA]
        );
        console.log("Consulta Select Realizada:")
        client.release();
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
        const client = await pool.connect();
        const ACT_ID = +(req.body.ACT_ID);
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

        client.release();
        console.log("ID BK", ACT_ID)
        console.log("Cambio de estado Inicio con fecha actual :")
        res.json({ message: 'ok' });



    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

actividadRoutes.post('/finalizar', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
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
            <p>Estimado/a usuario/a,</p>
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
        client.release();
        res.json({ message: 'ok' });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})


actividadRoutes.post('/modal', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        console.log(req.body)
        const ACT_ID = req.body.ACT_ID;
        const data_act = await client.query(
            `SELECT u."USR_NOMBRES", 
            u."USR_AP_PATERNO",
            a."ACT_NOMBRE",
            a."ACT_NOMBRE_SOLICITANTE", 
            a."ACT_DESCRIPCION", 
            p."PRO_NOMBRE",
            (a."ACT_DIRECCION" || ' - ' || CO."COM_NOMBRE") as "ACT_DIRECCION",
            d."DEP_MONTO" , 
            c."CLI_NOMBRE", 
            a."ACT_ID"
        FROM "ACTIVIDAD" a, "USUARIO" u, "AGENDA" age, "DEPOSITO" d,  "PROYECTO" p,  "CLIENTE" c, "COMUNA" co
            WHERE u."USR_ID" = age."AGE_USR_ID"
            AND a."ACT_AGE_ID"= age."AGE_ID"
            AND d."DEP_ACT_ID"= a."ACT_ID"
            AND a."ACT_PRO_ID"= p."PRO_ID"
            AND a."ACT_COM_ID"= co."COM_ID"
        AND c."CLI_ID"= p."PRO_CLI_ID"
            AND a."ACT_ID" = $1`,
            [ACT_ID]
        );

        client.release();
        res.json({ data_act });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

actividadRoutes.post('/auditor', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        console.log(req.body)
        const AGE_FECHA = req.body.AGE_FECHA;
        const auditor = await client.query(
            `SELECT 
            (U."USR_NOMBRES" || ' ' || U."USR_AP_PATERNO") as "USR_NOMBRES",
            a."ACT_NOMBRE",
            a."ACT_ID",
            a."ACT_DESCRIPCION",
            a."ACT_NOMBRE_SOLICITANTE",
            a."ACT_CORREO_SOLICITANTE",
            a."ACT_TELEFONO_SOLICITANTE",
            p."PRO_NOMBRE",
            cl."CLI_NOMBRE",
            c."CAL_COMENTARIO",
            tc."TC_NOMBRE"
            FROM "ACTIVIDAD" a left join "CALIFICACION" c on a."ACT_ID" = c."CAL_ACT_ID"
                left join "AGENDA" ag on a."ACT_AGE_ID" = ag."AGE_ID"
                left join "USUARIO" u on ag."AGE_USR_ID" = u."USR_ID"
                left join "PROYECTO" p on a."ACT_PRO_ID" = p."PRO_ID"
                left join "CLIENTE" cl on p."PRO_CLI_ID" = cl."CLI_ID"
                LEFT join "TIPO_CALIFICACION" tc on c."CAL_TC_ID" = tc."TC_ID"
            WHERE "ACT_ESTADO"='Finalizada' AND ag."AGE_FECHA"= $1`,
            [AGE_FECHA]
        );

        client.release();
        res.json({ auditor });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

actividadRoutes.get('/deposito', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        console.log(req.body)

        const deposito = await client.query(
            `SELECT (U."USR_NOMBRES" || ' ' || U."USR_AP_PATERNO") as "USR_NOMBRES",
            a."ACT_ID",
            a."ACT_NOMBRE",
            d."DEP_FECHA",
            d."DEP_ESTADO",
            d."DEP_MONTO",
            json_agg("MOT_NOMBRE")
     FROM "ACTIVIDAD" a
              left join "CALIFICACION" c on a."ACT_ID" = c."CAL_ACT_ID"
              left join "AGENDA" ag on a."ACT_AGE_ID" = ag."AGE_ID"
              left join "USUARIO" u on ag."AGE_USR_ID" = u."USR_ID"
              left join "PROYECTO" p on a."ACT_PRO_ID" = p."PRO_ID"
              left join "CLIENTE" cl on p."PRO_CLI_ID" = cl."CLI_ID"
              left join "DEPOSITO" d on a."ACT_ID" = d."DEP_ACT_ID"
              left join "DEPOSITO_MOTIVO" dm on d."DEP_ID" = dm."DEM_DEP_ID"
              left join "MOTIVO" m on dm."DEM_MOT_ID" = m."MOT_ID"
              LEFT join "TIPO_CALIFICACION" tc on c."CAL_TC_ID" = tc."TC_ID"
     WHERE "DEP_ESTADO" = 'Pendiente'
     GROUP BY (U."USR_NOMBRES" || ' ' || U."USR_AP_PATERNO"), a."ACT_ID", a."ACT_NOMBRE", d."DEP_FECHA", d."DEP_ESTADO", d."DEP_MONTO"`
        );

        client.release();
        res.json({ deposito });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})


actividadRoutes.get('/estadistica', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const fecha = new Date().getDate()
        console.log(fecha)
        const estadistica = await client.query(
            `SELECT * FROM (
                SELECT 'Finalizada'          as estado,
                       coalesce(count(*), 0) as cuenta
                FROM "ACTIVIDAD"
                WHERE "ACT_ESTADO" = 'Finalizada'
                  AND extract('DAY' FROM "ACT_FIN") = 10
                UNION
                SELECT 'Iniciada'            as estado,
                       coalesce(count(*), 0) as cuenta
                FROM "ACTIVIDAD"
                WHERE "ACT_ESTADO" = 'Iniciada'
                  AND extract('DAY' FROM "ACT_INICIO") = 10
                UNION
                SELECT 'Pendiente'           as estado,
                       coalesce(count(*), 0) as cuenta
                FROM "ACTIVIDAD"
                    left join public."AGENDA" A on A."AGE_ID" = "ACTIVIDAD"."ACT_AGE_ID"
                WHERE "ACT_ESTADO" = 'Finalizada'
                AND extract('DAY' FROM "AGE_FECHA") = 7) AS p
                order by  estado
                `,

        );

        client.release();
        res.json({ estadistica });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

)


actividadRoutes.post('/resdeposito', async (req: Request, res: Response) => {
    console.log("entrando a registrar dep", req.body)
    try {

        const client = await pool.connect();
        console.log(req.body.ACT_ID)
        const ACT_ID = req.body.ACT_ID;
        const finicio = await client.query(
            `UPDATE "DEPOSITO"
             SET "DEP_ESTADO"=$1
             WHERE "DEP_ACT_ID"=$2;`,
            ["Realizado", ACT_ID]
        );


        client.release();
        console.log(ACT_ID)
        console.log("Cambio de estado realizado:")


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})


actividadRoutes.post('/misactividades', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        console.log(req.body)
        const USR_ID = +(req.body.USR_ID)

        const asignacion = await client.query(
            `SELECT
            a."ACT_ID",
            a."ACT_NOMBRE",
            (a."ACT_DIRECCION" || ', ' || co."COM_NOMBRE") as "ACT_DIRECCION",
            d."DEP_FECHA",
            d."DEP_ESTADO",
            d."DEP_MONTO",
            a."ACT_ESTADO",
            a."ACT_NOMBRE_SOLICITANTE",
            a."ACT_CORREO_SOLICITANTE",
            a."ACT_TELEFONO_SOLICITANTE",
            age."AGE_FECHA",
            p."PRO_NOMBRE",
            c."CLI_NOMBRE"
        FROM "ACTIVIDAD" a, "USUARIO" u, "AGENDA" age, "DEPOSITO" d,  "PROYECTO" p,  "CLIENTE" c, "COMUNA" co
            WHERE u."USR_ID" = age."AGE_USR_ID"
            AND a."ACT_AGE_ID"= age."AGE_ID"
            AND d."DEP_ACT_ID"= a."ACT_ID"
            AND a."ACT_PRO_ID"= p."PRO_ID"
        AND c."CLI_ID"= p."PRO_CLI_ID"
        AND a."ACT_COM_ID"= co."COM_ID"
            AND u."USR_ID" = $1
            AND a."ACT_ESTADO" != 'Finalizada' `, [USR_ID]


        );

        client.release();
        res.json({ asignacion });


    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})



export default actividadRoutes;

