"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Token {
    constructor() {
    }
    static getJwtToken(payload) {
        return jsonwebtoken_1.default.sign({
            user: payload
        }, this.seed, { expiresIn: this.expires });
    }
    ;
    static validateToken(userToken) {
        return new Promise((reject, resolve) => {
            jsonwebtoken_1.default.verify(userToken, this.seed, (err, decoded) => {
                if (err) {
                }
                else {
                    resolve(decoded);
                }
            });
        });
    }
}
Token.seed = 'frase secreta';
Token.expires = '1d';
exports.default = Token;
