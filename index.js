require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require("./src/middleware/errorHandler");
const logger = require('./src/middleware/logger');
const corsOptions = require('./src/config/corsOptions');

const APP_PORT = process.env.APP_PORT || 3000;

const app = express();

app.use(errorHandler);
app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/*', (req, res) => {
    res.send('hello world');
})

app.listen(APP_PORT, () => {
    console.log(`App listening on port ${APP_PORT}`);
});

