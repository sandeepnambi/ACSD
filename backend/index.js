const app = require('./src/server');

// Health check route as requested by the user
app.get("/backend/api", (req, res) => {
  res.json({ message: "Backend working!" });
});

// Middleware to strip /backend prefix for Vercel routing
// This ensures that requests to /backend/api/auth/... are correctly routed to /api/auth/...
app.use((req, res, next) => {
  if (req.url.startsWith('/backend')) {
    req.url = req.url.replace('/backend', '');
  }
  next();
});

module.exports = app;

