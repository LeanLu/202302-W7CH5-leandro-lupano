import { UserStructure } from '../entities/user.model';
import { Repo } from '../repository/repo.interface';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/errors.js';
import { Auth, TokenPayload } from '../helpers/auth.js';
import { RequestPlus } from '../interceptors/logged';

const debug = createDebug('W7CH5:users-controller');

export class UsersController {
  constructor(public repoUser: Repo<UserStructure>) {
    this.repoUser = repoUser;
    debug('Controller instanced');
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

  async updateUserDetails(
    req: RequestPlus,
    resp: Response,
    next: NextFunction
  ) {
    try {
      debug('updateUserDetails method');

      const userId = req.info?.id;

      if (!userId)
        throw new HTTPError(404, 'Not found', 'Not found user ID in Token');

      const userIdToUpdate = req.params.id;

      if (!req.params.id)
        throw new HTTPError(404, 'Not found', 'Not found user ID in params');

      if (userId !== userIdToUpdate)
        throw new HTTPError(
          401,
          'Unauthorized',
          'The ID from params is not equal to ID from Token'
        );

      req.body.id = userId;

      const newUserInfo = await this.repoUser.update(req.body);

      resp.json({
        results: [newUserInfo],
      });
    } catch (error) {
      next(error);
    }
  }

  async addFriend(req: RequestPlus, resp: Response, next: NextFunction) {
    try {
      debug('addFriend method');

      const userId = req.info?.id;

      if (!userId) throw new HTTPError(404, 'Not found', 'Not found user ID');

      const actualUser = await this.repoUser.queryId(userId);

      const friendUser = await this.repoUser.queryId(req.params.id);

      if (!friendUser)
        throw new HTTPError(404, 'Not found', 'Not found user ID');

      if (actualUser.friends.find((item) => item.id === friendUser.id))
        throw new HTTPError(
          405,
          'Not allowed',
          'This new user is already added as friend'
        );

      actualUser.friends.push(friendUser);

      this.repoUser.update(actualUser);

      resp.json({
        results: [actualUser],
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFriend(req: RequestPlus, resp: Response, next: NextFunction) {
    try {
      debug('removeFriend method');

      const userId = req.info?.id;

      if (!userId) throw new HTTPError(404, 'Not found', 'Not found user ID');

      const actualUser = await this.repoUser.queryId(userId);

      const friendUser = await this.repoUser.queryId(req.params.id);

      if (!friendUser)
        throw new HTTPError(404, 'Not found', 'Not found user ID');

      actualUser.friends = actualUser.friends.filter(
        (item) => item.id !== friendUser.id
      );

      this.repoUser.update(actualUser);

      resp.json({
        results: [actualUser],
      });
    } catch (error) {
      next(error);
    }
  }

  async addEnemy(req: RequestPlus, resp: Response, next: NextFunction) {
    try {
      debug('addEnemy method');

      const userId = req.info?.id;

      if (!userId) throw new HTTPError(404, 'Not found', 'Not found user ID');

      const actualUser = await this.repoUser.queryId(userId);

      const enemyUser = await this.repoUser.queryId(req.params.id);

      if (!enemyUser)
        throw new HTTPError(404, 'Not found', 'Not found user ID');

      if (actualUser.enemies.find((item) => item.id === enemyUser.id))
        throw new HTTPError(
          405,
          'Not allowed',
          'This new user is already added as enemy'
        );

      actualUser.enemies.push(enemyUser);

      this.repoUser.update(actualUser);

      resp.json({
        results: [actualUser],
      });
    } catch (error) {
      next(error);
    }
  }

  async removeEnemy(req: RequestPlus, resp: Response, next: NextFunction) {
    try {
      debug('removeEnemy method');

      const userId = req.info?.id;

      if (!userId) throw new HTTPError(404, 'Not found', 'Not found user ID');

      const actualUser = await this.repoUser.queryId(userId);

      const enemyUser = await this.repoUser.queryId(req.params.id);

      if (!enemyUser)
        throw new HTTPError(404, 'Not found', 'Not found user ID');

      actualUser.enemies = actualUser.enemies.filter(
        (item) => item.id !== enemyUser.id
      );

      this.repoUser.update(actualUser);

      resp.json({
        results: [actualUser],
      });
    } catch (error) {
      next(error);
    }
  }
}
