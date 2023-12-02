"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionData = exports.client = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const { Client } = require('pg');
const server_1 = __importDefault(require("./classes/server"));
const actividad_routes_1 = __importDefault(require("./routes/actividad.routes"));
const default_routes_1 = __importDefault(require("./routes/default.routes"));
const angenda_routes_1 = __importDefault(require("./routes/angenda.routes"));
const usuario_routes_1 = __importDefault(require("./routes/usuario.routes"));
const proyecto_routes_1 = __importDefault(require("./routes/proyecto.routes"));
const comuna_routes_1 = __importDefault(require("./routes/comuna.routes"));
const hora_routes_1 = __importDefault(require("./routes/hora.routes"));
const cors_1 = __importDefault(require("cors"));
const motivo_routes_1 = __importDefault(require("./routes/motivo.routes"));
const server = new server_1.default();
server.app.use((0, cors_1.default)());
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
server.app.use('/', default_routes_1.default);
server.app.use('/actividad', actividad_routes_1.default);
server.app.use('/agenda', angenda_routes_1.default);
server.app.use('/usuario', usuario_routes_1.default);
server.app.use('/proyecto', proyecto_routes_1.default);
server.app.use('/comuna', comuna_routes_1.default);
server.app.use('/hora', hora_routes_1.default);
server.app.use('/motivo', motivo_routes_1.default);
const connectionData = {
    user: 'administrador',
    host: 'asignacionesdb.postgres.database.azure.com',
    database: 'ASIGNACIONES',
    password: 'Proyecto14122023',
    port: 5432,
    ssl: true,
};
exports.connectionData = connectionData;
const client = new Client(connectionData);
exports.client = client;
server.Start(() => {
    console.log(`Servidor corriendo en puerto:${server.port}`);
});
