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
const usuarioRoutes = (0, express_1.Router)();
usuarioRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, dbConnection_1.connectToDB)();
        const consulta = `INSERT INTO "USUARIO" ("USR_NOMBRES", "USR_AP_PATERNO", "USR_AP_MATERNO", "USR_RUT", "USR_CORREO", "USR_CONTRASENA", "USR_COM_ID", "USR_ROL_ID") VALUES  ($1,$2,$3,$4,$5,$6,$7,$8)RETURNING "AGE_ID";`;
        const valores = ['Carlos', 'Rodriguez', 'Perez', '11111111-1', 'crodiguez@example.com', 'contraseña_22', 1, 2]; // Valores para la inserción
        const resultado = yield client.query(consulta, valores);
        console.log('Registro insertado con éxito en Usuario:');
        console.log('ID del nuevo registro:', resultado.rows[0].USR_ID);
        console.log(req.body);
        res.json({
            ok: true,
            resultado: 'post usuario ok'
        });
    }
    catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
}));
exports.default = usuarioRoutes;
