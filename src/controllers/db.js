const postgres = require('postgres');

const postgresConnection = postgres();

module.exports = postgresConnection;
