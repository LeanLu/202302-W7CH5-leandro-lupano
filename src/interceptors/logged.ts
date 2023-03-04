import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/errors.js';
import { Auth, TokenPayload } from '../helpers/auth.js';
import createDebug from 'debug';

const debug = createDebug('W7CH5:logged');

export interface RequestPlus extends Request {
  info?: TokenPayload;
}

export function logged(req: RequestPlus, _resp: Response, next: NextFunction) {
  try {
    debug('Logged function');

    const authHeader = req.get('Authorization');

    if (!authHeader)
      throw new HTTPError(498, 'Invalid Token', 'Not value in auth header');

    if (!authHeader.startsWith('Bearer'))
      throw new HTTPError(498, 'Invalid Token', 'Not Bearer in auth header');

    const token = authHeader.slice(7);

    const payload = Auth.verifyJWT(token);

    req.info = payload;

    next();
  } catch (error) {
    next(error);
  }
}
