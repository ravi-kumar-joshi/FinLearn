const User = require('../models/User')

async function adminOnly(req, res, next) {
    try {
        if (!req.id) return res.status(403).json({ success: false, message: 'Unauthorized' })
        const user = await User.findById(req.id)
        if (!user || !user.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' })
        next()
    } catch (err) { next(err) }
}

module.exports = adminOnly
