"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { Client } = require('pg');
const dbConnection_1 = require("../classes/dbConnection");
const deposito_routes_1 = __importDefault(require("./deposito.routes"));
const actividadRoutes = (0, express_1.Router)();
actividadRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield (0, dbConnection_1.connectToDB)();
    insertAgenda(req, client).then((idAgenda) => {
        console.log(idAgenda);
        console.log(req.body.AH_HOR_ID);
        agendaHora(idAgenda, client, req.body.AH_HOR_ID);
        insertActividad(req, idAgenda, client).then(idActividad => {
            console.log(idActividad);
            const enviarDeposito = { idAct: idActividad, DEP_MONTO: req.body.DEP_MONTO };
            const DEP_ID = deposito_routes_1.default.insertDeposito(idActividad, req.body.DEP_MONTO, client);
            //depositoRoutes.insertMotivoDeposito(DEP_ID, client, req.body.DM_MOT_ID)
        });
    });
    /*try {
        const client = await connectToDB();
        const consulta = `INSERT INTO "ACTIVIDAD" ("ACT_NOMBRE", "ACT_DESCRIPCION", "ACT_ESTADO", "ACT_DIRECCION", "ACT_INICIO", "ACT_FIN", "ACT_COM_ID", "ACT_PRO_ID", "ACT_AGE_ID", "ACT_NOMBRE_SOLICITANTE", "ACT_TELEFONO_SOLICITANTE", "ACT_CORREO_SOLICITANTE") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)RETURNING "ACT_ID";`
        const valores = ['REQ_999999', 'Realizar Cambio de Disco Duro y RAM', 'Pendiente', 'Huerfanos 1409', , , 1, 1, 3, 'Carolina Cuevas', '9669111', 'ccuevasp@pjud.cl']; // Valores para la inserción

        const resultado: QueryResult = await client.query(consulta, valores);

        console.log('Registro insertado con éxito en Actividad:');
        console.log('ID del nuevo registro:', resultado.rows[0].ACT_ID);

        console.log(req.body)
        res.json({
            ok: true,
            resultado: 'post act ok'
        });
    } catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }*/
}));
actividadRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, dbConnection_1.connectToDB)();
        const actividades = yield client.query(`SELECT * FROM "AGENDA";`);
        console.log("Consulta Select Realizada:");
        res.json({ actividades });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
function insertAgenda(req, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const client = await connectToDB();
            const consulta = `INSERT INTO "AGENDA" ("AGE_FECHA", "AGE_ESTADO", "AGE_USR_ID") VALUES ($1,$2,$3)RETURNING "AGE_ID";`;
            const valores = [req.body.AGE_FECHA, "Asignada", req.body.AGE_USR_ID]; // Valores para la inserción
            const resultado = yield client.query(consulta, valores);
            console.log('Registro insertado con éxito en Agenda:');
            console.log('ID nueva AGENDA:', resultado.rows[0].AGE_ID);
            return (resultado.rows[0].AGE_ID);
        }
        catch (error) {
            console.error('Error al insertar registro:', error);
            return -1;
        }
    });
}
function insertActividad(req, AGE_ID, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const client = await connectToDB();
            const consulta = `INSERT INTO "ACTIVIDAD" ("ACT_NOMBRE", "ACT_DESCRIPCION", "ACT_ESTADO", "ACT_DIRECCION", "ACT_COM_ID", "ACT_PRO_ID", "ACT_AGE_ID", "ACT_NOMBRE_SOLICITANTE", "ACT_TELEFONO_SOLICITANTE", "ACT_CORREO_SOLICITANTE") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10)RETURNING "ACT_ID";`;
            const valores = [req.body.ACT_NOMBRE, req.body.ACT_DESCRIPCION, "Pendiente", req.body.ACT_DIRECCION, req.body.ACT_COM_ID, req.body.ACT_PRO_ID, AGE_ID, req.body.ACT_NOMBRE_SOLICITANTE, req.body.ACT_TELEFONO_SOLICITANTE, req.body.ACT_CORREO_SOLICITANTE]; // Valores para la inserción
            const resultado = yield client.query(consulta, valores);
            console.log('Registro insertado con éxito en Actividad:');
            console.log('ID nueva ACTIVIDAD:', resultado.rows[0].ACT_ID);
            return (resultado.rows[0].ACT_ID);
        }
        catch (error) {
            console.error('Error al insertar registro:', error);
            return -1;
        }
    });
}
function agendaHora(AGE_ID, client, AH_HOR_ID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const client = await connectToDB();
            for (const idhora of AH_HOR_ID) {
                const consulta = `INSERT INTO "AGENDA_HORA" ("AH_AGE_ID", "AH_HOR_ID")VALUES ($1, $2);`;
                const valores = [AGE_ID, idhora]; // Valores para la inserción
                console.log(idhora);
                const resultado = yield client.query(consulta, valores);
            }
            console.log('Registro insertado con éxito en agenda hora:');
        }
        catch (error) {
            console.error('Error al insertar registro:', error);
            return -1;
        }
    });
}
exports.default = actividadRoutes;
