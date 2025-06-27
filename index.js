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
const notificationsRouter = require('./src/routes/notifications');
const chatRouter = require('./src/routes/chat');

const path = require('path');
const { setupSockets } = require('./src/socket');
const http = require('http');
const { prisma } = require('./src/db/client');

const API_ROUTE = process.env.API_ROUTE || '/api/v1';


const app = express();
const server = http.createServer(app);

const reactBuildPath = path.join(__dirname, 'build');

app.use(express.static(reactBuildPath));
app.get(/^\/(?!api\/v1|static).*/, (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(errorHandler);
app.use(logger);

app.use('/static', express.static(path.join(__dirname, 'attachments')));

app.use(`${API_ROUTE}`, refreshTokenRouter);
app.use(`${API_ROUTE}`, registerRouter);
app.use(`${API_ROUTE}`, authRouter);
app.use(`${API_ROUTE}`, usersRouter);
app.use(`${API_ROUTE}`, postsRouter);
app.use(`${API_ROUTE}`, commentsRouter);
app.use(`${API_ROUTE}`, notificationsRouter);
app.use(`${API_ROUTE}`, chatRouter);

setupSockets(server);

const initDatabase = async () => {
    await prisma.roles.createMany({
        data: [
            { id: 3146, name: 'Admin' },
            { id: 8153, name: 'Verified' },
            { id: 2771, name: 'User' },
            { id: 9121, name: 'Moderator' }
        ],
        skipDuplicates: true,
    });

    await prisma.post_statuses.createMany({
        data: [
            { id: 1, name: 'OK' },
            { id: 2, name: 'URGENT' },
            { id: 3, name: 'INFO' }
        ],
        skipDuplicates: true,
    });
}

server.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
    initDatabase();
});
