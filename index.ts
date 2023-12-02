import bodyParser, { urlencoded } from "body-parser";
const { Client } = require('pg')
import Server from "./classes/server";
import actividadRoutes from "./routes/actividad.routes";
import defaultRoutes from "./routes/default.routes";
import agendaRoutes from "./routes/angenda.routes";
import usuarioRoutes from "./routes/usuario.routes";
import proyectoRoutes from "./routes/proyecto.routes";
import comunaRoutes from "./routes/comuna.routes";
import horaRoutes from "./routes/hora.routes";
import cors from "cors";
import motivoroutes from "./routes/motivo.routes";



const server = new Server();

server.app.use(cors());
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());
server.app.use('/', defaultRoutes);
server.app.use('/actividad', actividadRoutes);
server.app.use('/agenda', agendaRoutes);
server.app.use('/usuario', usuarioRoutes);
server.app.use('/proyecto', proyectoRoutes);
server.app.use('/comuna', comunaRoutes);
server.app.use('/hora', horaRoutes);
server.app.use('/motivo', motivoroutes);

const connectionData = {
    user: 'administrador',
    host: 'asignacionesdb.postgres.database.azure.com',
    database: 'ASIGNACIONES',
    password: 'Proyecto14122023',
    port: 5432,
    ssl: true,
}
const client = new Client(connectionData)

server.Start(() => {
    console.log(`Servidor corriendo en puerto:${server.port}`)

})

export { client, connectionData };