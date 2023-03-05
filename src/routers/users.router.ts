import { Router as router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { logged } from '../interceptors/logged.js';
import { UsersMongoRepo } from '../repository/users.mongo.repo.js';
import createDebug from 'debug';

const debug = createDebug('W7CH5:router');

export const usersRouter = router();
const repoUsers = UsersMongoRepo.getInstance();
const controller = new UsersController(repoUsers);

debug('Users Router');

usersRouter.post('/register', controller.register.bind(controller));
usersRouter.post('/login', controller.login.bind(controller));
usersRouter.get('/', logged, controller.getAll.bind(controller));
usersRouter.patch(
  '/details/:id',
  logged,
  controller.updateUserDetails.bind(controller)
);
usersRouter.patch(
  '/add_friends/:id',
  logged,
  controller.addFriend.bind(controller)
);
usersRouter.patch(
  '/remove_friends/:id',
  logged,
  controller.removeFriend.bind(controller)
);
usersRouter.patch(
  '/add_enemies/:id',
  logged,
  controller.addEnemy.bind(controller)
);
usersRouter.patch(
  '/remove_enemies/:id',
  logged,
  controller.removeEnemy.bind(controller)
);
