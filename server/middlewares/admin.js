/**
 * Admin-Only Middleware
 *
 * Verifies the authenticated user has admin privileges.
 * Must be used after the `auth` middleware which populates req.id and req.isAdmin.
 *
 * Fix applied:
 *   #10 - isAdmin is now read from req.isAdmin (set by auth.js from the JWT payload)
 *         instead of making a redundant User.findById() DB call on every admin request.
 *         This eliminates one DB round-trip per admin API hit.
 *         NOTE: If an admin's privileges are revoked, they will retain access until
 *         their current JWT expires. For immediate revocation, implement a token
 *         blocklist or shorten the access-token TTL.
 */

async function adminOnly(req, res, next) {
  try {
    // auth middleware guarantees req.id is set; a missing id means auth was skipped.
    if (!req.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // FIX #10: Read isAdmin from the JWT claim (set by auth middleware).
    // Previously this did User.findById(req.id) on every request — unnecessary
    // when the flag is already embedded in the signed, verified token.
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = adminOnly;
