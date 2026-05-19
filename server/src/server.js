/*
  server/src/server.js

  Purpose:
  - Entry point that connects to the database and starts the HTTP server.
  - Keeps bootstrap logic minimal by delegating configuration to `app`.
*/

const app = require('./app');
const getConnection = require('../utils/getConnection');

// Connect to the database (MongoDB/Postgres/etc. depending on implementation).
// `getConnection` should handle its own errors and retries where applicable.
getConnection();

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
