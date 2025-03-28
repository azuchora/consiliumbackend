const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('./src/middleware/logger');
const corsOptions = require('./src/config/corsOptions');

const APP_PORT = process.env.APP_PORT || 3000;

const app = express();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.get('/*', (req, res) => {
    res.send('hello world');
})

app.listen(APP_PORT, () => {
    console.log(`App listening on port ${APP_PORT}`);
});

