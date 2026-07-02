export function adminAuth(req, res, next) {
  const token    = req.headers['x-admin-token'];
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(503).json({ error: 'ADMIN_PASSWORD is not set in .env' });
  }
  if (!token || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
