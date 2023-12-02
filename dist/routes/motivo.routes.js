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
const motivoroutes = (0, express_1.Router)();
motivoroutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield poolConnetion_1.default.connect();
        const motivo = yield client.query(`SELECT * FROM "MOTIVO";`);
        console.log("Consulta Select motivo Ok:");
        client.release();
        return res.json({ motivo });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
exports.default = motivoroutes;
