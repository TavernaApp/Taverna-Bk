require('dotenv').config(); // Load environment variables from .env file

const { Sequelize } = require('sequelize');

// Create a Sequelize instance with connection pooling and max connections
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // Assuming dialect is always MySQL
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool (optional)
    acquire: 60000, // Maximum time (in milliseconds) that sequelize should try to get a connection before throwing an error
    idle: 10000 // Maximum time (in milliseconds) that a connection can be idle before being released from the pool
  }
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Export the sequelize instance
module.exports = sequelize;

// Call the testConnection function to check if the connection is successful
testConnection();
