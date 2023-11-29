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
const dbConnection_1 = require("../classes/dbConnection");
const depositoRoutes = (0, express_1.Router)();
depositoRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield (0, dbConnection_1.connectToDB)();
}));
function insertDeposito(idActividad, DEP_MONTO, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const client = await connectToDB();
            const consulta = `INSERT INTO "DEPOSITO" ("DEP_FECHA", "DEP_MONTO", "DEP_ESTADO", "DEP_ACT_ID", "DEP_ARCHIVO_ADJ") VALUES 
         ($1,$2,$3,$4,$5)RETURNING "DEP_ID";`;
            const valores = ['2023-11-20', DEP_MONTO, 'Pendiente', idActividad, 'URL ADJUNTO']; // Valores para la inserción
            const resultado = yield client.query(consulta, valores);
            console.log('Registro insertado con éxito en deposito:');
            console.log('ID nuevo DEPOSITO:', resultado.rows[0].DEP_ID);
            return (resultado.rows[0].DEP_ID);
        }
        catch (error) {
            console.error('Error al insertar registro:', error);
            return -1;
        }
    });
}
function insertMotivoDeposito(idActividad, DEP_MONTO, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const client = await connectToDB();
            const consulta = `INSERT INTO "DEPOSITO" ("DEP_FECHA", "DEP_MONTO", "DEP_ESTADO", "DEP_ACT_ID", "DEP_ARCHIVO_ADJ") VALUES 
         ($1,$2,$3,$4,$5)RETURNING "DEP_ID";`;
            const valores = ['2023-11-20', DEP_MONTO, 'Pendiente', idActividad, 'URL ADJUNTO']; // Valores para la inserción
            const resultado = yield client.query(consulta, valores);
            console.log('Registro insertado con éxito en deposito:');
            console.log('ID nuevo DEPOSITO:', resultado.rows[0].DEP_ID);
            return (resultado.rows[0].DEP_ID);
        }
        catch (error) {
            console.error('Error al insertar registro:', error);
            return -1;
        }
    });
}
exports.default = { depositoRoutes, insertDeposito, insertMotivoDeposito };
