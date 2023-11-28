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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { Client } = require('pg');
const dbConnection_1 = require("../classes/dbConnection");
const actividadRoutes = (0, express_1.Router)();
actividadRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, dbConnection_1.connectToDB)();
        const consulta = `INSERT INTO "ACTIVIDAD" ("ACT_NOMBRE", "ACT_DESCRIPCION", "ACT_ESTADO", "ACT_DIRECCION", "ACT_INICIO", "ACT_FIN", "ACT_COM_ID", "ACT_PRO_ID", "ACT_AGE_ID", "ACT_NOMBRE_SOLICITANTE", "ACT_TELEFONO_SOLICITANTE", "ACT_CORREO_SOLICITANTE") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)RETURNING "ACT_ID";`;
        const valores = ['REQ_999999', 'Realizar Cambio de Disco Duro y RAM', 'Pendiente', 'Huerfanos 1409', , , 1, 1, 3, 'Carolina Cuevas', '9669111', 'ccuevasp@pjud.cl']; // Valores para la inserción
        const resultado = yield client.query(consulta, valores);
        console.log('Registro insertado con éxito en Actividad:');
        console.log('ID del nuevo registro:', resultado.rows[0].ACT_ID);
        console.log(req.body);
        res.json({
            ok: true,
            resultado: 'post act ok'
        });
    }
    catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
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
exports.default = actividadRoutes;
