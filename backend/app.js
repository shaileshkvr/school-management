import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// read and write secure cookies only via server
app.use(cookieParser());
app.use(express.static('public'));
// parse JSON and URL-encoded data with a limit of 20kb
app.use(express.json({ limit: '20kb' }));
// parse URL-encoded data with a limit of 20kb
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
// enable CORS with specific origin and credentials
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Routes imports

import authRouter from './routes/auth.routes.js';
import testRouter from './routes/test.routes.js';

export const apiPath = '/scmgt/api/v1';

// Routes declarations
app.use(`${apiPath}/auth`, authRouter);

// Test routes
app.use(`${apiPath}/test`, testRouter);

// app.use(`${apiPath}/users`, userRouter);
// this will create a route like "https://localhost:<port>/api/v1/users/<controller method>"
// the '/register' is comming from userRouter or 'user.routes.js' when you purposly hit '/register' request
// similarly '/login' can also be created in user.routes.js file that will call its respective controller

app.get('/', (_, res) =>
  res.send({
    user: 'Shailesh Kr Verma',
    status: 'Server runnning, connected to db',
    message: 'Server under development',
  })
);

export default app;
