require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./src/middleware/errorHandler');
const credentials = require('./src/middleware/credentials');
const { logger } = require('./src/middleware/logger');
const corsOptions = require('./src/config/corsOptions');
const registerRouter = require('./src/routes/register');
const authRouter = require('./src/routes/auth');
const refreshTokenRouter = require('./src/routes/refreshToken');
const postsRouter = require('./src/routes/posts');
const usersRouter = require('./src/routes/users');
const commentsRouter = require('./src/routes/comments');

const APP_PORT = process.env.APP_PORT || 3300;
const API_ROUTE = process.env.API_ROUTE;

const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(errorHandler);
app.use(logger);

app.use(`${API_ROUTE}`, refreshTokenRouter);
app.use(`${API_ROUTE}`, registerRouter);
app.use(`${API_ROUTE}`, authRouter);
app.use(`${API_ROUTE}`, postsRouter);
app.use(`${API_ROUTE}`, usersRouter);
app.use(`${API_ROUTE}`, commentsRouter);

app.get('/*', async (req, res) => {
    res.send('hello world');
})

app.listen(APP_PORT, () => {
    console.log(`App listening on port ${APP_PORT}`);
});
