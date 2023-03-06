import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { usersRouter } from './routers/users.router.js';
import path from 'path';
import { __dirname } from './helpers/files.js';
import createDebug from 'debug';
import { errorsMiddleware } from './middleware/errors.middleware.js';

const debug = createDebug('W7CH5:app');

export const app = express();

const corsOptions = {
  origin: '*',
};

app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));

debug({ __dirname });
app.use(express.static(path.resolve(__dirname, 'public')));

app.use('/users', usersRouter);

app.use(errorsMiddleware);

app.use('*', (_req, resp, next) => {
  resp
    .status(404)
    .send(
      `<h1>Sorry, the path is not valid. Please, check the information.<h1>`
    );
  next();
});
