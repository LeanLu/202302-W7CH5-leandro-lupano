import { Router as router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { Interceptors } from '../interceptors/interceptors.js';
import { UsersMongoRepo } from '../repository/users.mongo.repo.js';
import createDebug from 'debug';

const debug = createDebug('W7CH5:router');

export const usersRouter = router();
const repoUsers = UsersMongoRepo.getInstance();
const controller = new UsersController(repoUsers);

debug('Users Router');

usersRouter.post('/register', controller.register.bind(controller));
usersRouter.post('/login', controller.login.bind(controller));
usersRouter.get('/', Interceptors.logged, controller.getAll.bind(controller));
usersRouter.patch(
  '/details/:id',
  Interceptors.logged,
  Interceptors.authorized,
  controller.updateUserDetails.bind(controller)
);
usersRouter.patch(
  '/add_friends/:id',
  Interceptors.logged,
  controller.addFriend.bind(controller)
);
usersRouter.patch(
  '/remove_friends/:id',
  Interceptors.logged,
  controller.removeFriend.bind(controller)
);
usersRouter.patch(
  '/add_enemies/:id',
  Interceptors.logged,
  controller.addEnemy.bind(controller)
);
usersRouter.patch(
  '/remove_enemies/:id',
  Interceptors.logged,
  controller.removeEnemy.bind(controller)
);
