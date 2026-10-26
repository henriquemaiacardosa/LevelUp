const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  })
);
app.use(express.json());
app.use('/api', routes);

module.exports = app;