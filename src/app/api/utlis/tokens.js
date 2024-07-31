import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY);

}

export function createToken(data, options) {
    return jwt.sign(data, SECRET_KEY, options ? options : {expiresIn: '30d'});
}