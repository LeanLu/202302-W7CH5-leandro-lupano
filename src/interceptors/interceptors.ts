import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/errors.js';
import { Auth, TokenPayload } from '../helpers/auth.js';
import createDebug from 'debug';

const debug = createDebug('W7CH5:logged');

export interface RequestPlus extends Request {
  info?: TokenPayload;
}

export abstract class Interceptors {
  static logged(req: RequestPlus, _resp: Response, next: NextFunction) {
    try {
      debug('Logged Interceptor');

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

  static authorized(req: RequestPlus, _resp: Response, next: NextFunction) {
    try {
      debug('Authorized Interceptor');

      if (!req.info)
        throw new HTTPError(
          498,
          'Token not found',
          'Token not found in authorized interceptor'
        );

      if (!req.params.id)
        throw new HTTPError(404, 'Not found', 'Not found user ID in params');

      if (req.info?.id !== req.params.id)
        throw new HTTPError(
          401,
          'Unauthorized',
          'The ID from params is not equal to ID from Token'
        );

      req.body.id = req.info?.id;

      next();
    } catch (error) {
      next(error);
    }
  }
}
