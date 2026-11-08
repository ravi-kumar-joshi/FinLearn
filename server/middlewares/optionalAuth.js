const jwt = require('jsonwebtoken');
function optionalAuth(req, res, next) {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken || !process.env.ACCESS_TOKEN_KEY) {
        return next();
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        if (decoded?.id) {
            req.id = decoded.id;
            if (decoded.email) req.email = decoded.email;
        }
    } catch {
    }
    next();
}

module.exports = optionalAuth;
