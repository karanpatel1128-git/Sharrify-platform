require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4'
};

let connection;

// Function to handle connection and reconnection logic
function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        } else {
            console.log('Connected to MySQL Server!🔌' );
        }
    });

    // Handle connection errors
    connection.on('error', (err) => {
        console.error('Database connection error: ⚠️', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Connection lost. Reconnecting...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

// Initialize connection
handleDisconnect();

// Promisified methods for database operations
function makeDb() {
    return {
        async query(sql, args) {
            console.log('Executing query:', sql);
            return util.promisify(connection.query).call(connection, sql, args);
        },
        async close() {
            console.log('Closing database connection...');
            return util.promisify(connection.end).call(connection);
        }
    };
}

// Export the database object
const db = makeDb();
module.exports = db;
