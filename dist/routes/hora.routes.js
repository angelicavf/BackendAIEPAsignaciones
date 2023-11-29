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
const horaRoutes = (0, express_1.Router)();
horaRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield (0, dbConnection_1.connectToDB)();
        const hora = yield client.query(`SELECT * FROM "HORA";`);
        console.log("Consulta Select hora Ok:");
        return res.json({ hora });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
function obtenerHorasDisponibles() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield (0, dbConnection_1.connectToDB)(); // Obtener conexión a la base de datos
            const consulta = `SELECT "HOR_ID" FROM "HORA"`; // Consulta para obtener los id de las horas
            const resultado = yield client.query(consulta);
            const horasDisponibles = resultado.rows.map((row) => row.id);
            yield client.end(); // Cerrar conexión con la base de datos
            return horasDisponibles;
        }
        catch (error) {
            console.error('Error al obtener las horas disponibles:', error);
            throw new Error('Error al obtener las horas disponibles');
        }
    });
}
exports.default = horaRoutes;
