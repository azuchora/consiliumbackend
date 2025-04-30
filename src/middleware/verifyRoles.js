const { StatusCodes } = require('http-status-codes');

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user?.roles) return res.sendStatus(StatusCodes.UNAUTHORIZED);
        const rolesArray = [...allowedRoles];
        console.log(rolesArray, '----', req.user.roles)
        const result = req.user.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return res.sendStatus(StatusCodes.UNAUTHORIZED);
        next();
    }
}

module.exports = verifyRoles;
