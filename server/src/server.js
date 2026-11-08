
const app = require('./app');
const getConnection = require('../utils/getConnection');
getConnection();

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
