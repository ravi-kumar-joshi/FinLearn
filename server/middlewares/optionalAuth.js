const jwt = require('jsonwebtoken');

/**
 * If a valid accessToken cookie is present, attaches req.id and req.email (same as auth).
 * Does not reject anonymous requests — used for public GET routes that merge user progress.
 */
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
        // Expired or invalid token: treat as anonymous for this request
    }
    next();
}

module.exports = optionalAuth;
