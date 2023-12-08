import jwt from 'jsonwebtoken'

export default class Token {


    private static seed: string = 'frase secreta'
    private static expires: string = '1d'


    constructor() {
    }

    static getJwtToken(payload: any) {

        return jwt.sign({
            user: payload
        }, this.seed, { expiresIn: this.expires })

    };

    static validateToken(userToken: string) {

        return new Promise((reject, resolve) => {
            jwt.verify(userToken, this.seed, (err, decoded) => {
                if (err) {

                } else {
                    resolve(decoded);
                }

            })

        })
    }

}