const express = require('express');
const app = require('./src/server');

// Create a wrapper app to handle the /backend prefix correctly
const wrapper = express();

// Mount the main app logic under /backend
wrapper.use('/backend', app);

// Specific health check as requested
wrapper.get("/backend/api", (req, res) => {
  res.json({ message: "Backend working!" });
});

module.exports = wrapper;


