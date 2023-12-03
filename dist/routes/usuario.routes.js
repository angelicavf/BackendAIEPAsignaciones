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
const poolConnetion_1 = __importDefault(require("../classes/poolConnetion"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuarioRoutes = (0, express_1.Router)();
usuarioRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield poolConnetion_1.default.connect();
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
        client.release();
    }
    catch (error) {
        console.error('Error al insertar registro:', error);
        res.status(500).json({ ok: false, error: 'Error al insertar registro' });
    }
}));
usuarioRoutes.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield poolConnetion_1.default.connect();
        const tokenInfo = yield encontrarUsuario(req.body.USR_CORREO, req.body.USR_CONTRASENA);
        if (tokenInfo) {
            res.status(200).json(tokenInfo); // Envía el token al cliente
        }
        else {
            res.status(401).json(tokenInfo);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
}));
function encontrarUsuario(correo, contrasena) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ... Tu código para buscar el usuario por su nombre y contraseña ...
            const client = yield poolConnetion_1.default.connect();
            const resultado = yield client.query(`SELECT *
                FROM "USUARIO" WHERE "USR_CORREO"=$1 AND "USR_CONTRASENA" = $2;`, [correo, contrasena]);
            if (resultado.rows.length > 0) {
                const usuarioEncontrado = resultado.rows[0];
                // Verifica si la contraseña coincide
                if (usuarioEncontrado.USR_CONTRASENA == contrasena) {
                    const ok = true;
                    const token = jsonwebtoken_1.default.sign({ correo: usuarioEncontrado.USR_CORREO }, 'secretoAsignaciones');
                    console.log("Login OK");
                    console.log(token);
                    client.release();
                    return { token, ok }; // Devuelve el token al cliente
                }
                else {
                    const ok = false;
                    const token = null;
                    console.log("esta pasando aqui");
                    client.release();
                    return { token, ok }; // Contraseña incorrecta
                }
            }
            else {
                const ok = false;
                const token = null;
                client.release();
                console.log("esta pasando aqui");
                return { token, ok }; // Usuario no encontrado
            }
        }
        catch (error) {
            console.error('Error al buscar usuario:', error);
            throw error; // Manejo de errores
        }
    });
}
usuarioRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield poolConnetion_1.default.connect();
        const usuarios = yield client.query(`SELECT * FROM "USUARIO";`);
        console.log("Consulta Select usuario Ok:");
        client.release();
        return res.json({ usuarios });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
exports.default = usuarioRoutes;
