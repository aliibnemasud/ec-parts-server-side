// Verify JWT Token
require('dotenv').config()
const jwt = require('jsonwebtoken');
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JSON_WEB_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err)
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

module.exports = verifyJwt;