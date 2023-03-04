import { UserStructure } from '../entities/user.model';
import { Repo } from '../repository/repo.interface';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/errors.js';
import { Auth, TokenPayload } from '../helpers/auth.js';

const debug = createDebug('W7CH5:users-controller');

export class UsersController {
  constructor(public repoUser: Repo<UserStructure>) {
    this.repoUser = repoUser;
    debug('Controller instanced');
  }

  async getAll(_req: Request, resp: Response, next: NextFunction) {
    try {
      debug('getAll method');

      const data = await this.repoUser.query();

      resp.json({
        results: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('register:post method');

      if (!req.body.userName || !req.body.password)
        throw new HTTPError(
          401,
          'Unauthorized',
          'Invalid User Name o password'
        );

      req.body.password = await Auth.hash(req.body.password);

      req.body.friends = [];
      req.body.enemies = [];

      const data = await this.repoUser.create(req.body);

      resp.status(201);
      resp.json({
        results: [data],
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, resp: Response, next: NextFunction) {
    try {
      debug('login:post method');

      if (!req.body.userName || !req.body.password)
        throw new HTTPError(
          401,
          'Unauthorized',
          'Invalid User Name o password'
        );

      const data = await this.repoUser.search({
        key: 'userName',
        value: req.body.userName,
      });

      if (!data.length)
        throw new HTTPError(401, 'Unauthorized', 'User Name not found');

      if (!(await Auth.compare(req.body.password, data[0].password)))
        throw new HTTPError(401, 'Unauthorized', 'Password not match');

      const payload: TokenPayload = {
        id: data[0].id,
        userName: data[0].userName,
        role: 'Admin',
      };

      const token = Auth.createJWT(payload);

      resp.status(202);
      resp.json({
        results: {
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
