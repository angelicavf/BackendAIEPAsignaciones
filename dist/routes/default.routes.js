"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const defaultRoutes = (0, express_1.Router)();
defaultRoutes.get('/', (req, res) => {
    return res.json({
        ok: true,
        msj: 'get ok'
    });
});
defaultRoutes.post('/', (req, res) => {
    return res.json({
        ok: true,
        msj: 'post ok'
    });
});
exports.default = defaultRoutes;
