import { UserStructure } from '../entities/user.model';
import { HTTPError } from '../errors/errors.js';
import { Repo } from './repo.interface';
import { UserModel } from './users.mongo.model.js';
import createDebug from 'debug';

const debug = createDebug('W7CH5:users-repo');

export class UsersMongoRepo implements Repo<UserStructure> {
  private static instance: UsersMongoRepo;

  public static getInstance(): UsersMongoRepo {
    if (!UsersMongoRepo.instance) {
      UsersMongoRepo.instance = new UsersMongoRepo();
    }

    return UsersMongoRepo.instance;
  }

  private constructor() {
    debug('Users-Repo instanced');
  }

  async query(): Promise<UserStructure[]> {
    debug('query method');
    const data = await UserModel.find().populate(['friends', 'enemies'], {
      friends: 0,
      enemies: 0,
    });
    return data;
  }

  async queryId(id: string): Promise<UserStructure> {
    debug('queryID method');
    const data = await UserModel.findById(id).populate(['friends', 'enemies'], {
      friends: 0,
      enemies: 0,
    });
    if (!data) throw new HTTPError(404, 'Not found', 'ID not found in queryID');
    return data;
  }

  async search(query: { key: string; value: unknown }) {
    debug('search method');
    const data = await UserModel.find({ [query.key]: query.value }).populate(
      ['friends', 'enemies'],
      {
        friends: 0,
        enemies: 0,
      }
    );
    return data;
  }

  async create(info: Partial<UserStructure>): Promise<UserStructure> {
    debug('create method');
    const data = await UserModel.create(info);
    return data;
  }

  async update(info: Partial<UserStructure>): Promise<UserStructure> {
    debug('update method');
    const data = await UserModel.findByIdAndUpdate(info.id, info, {
      new: true,
    }).populate(['friends', 'enemies'], {
      friends: 0,
      enemies: 0,
    });
    if (!data) throw new HTTPError(404, 'Not found', 'ID not found in update');
    return data;
  }

  async destroy(id: string): Promise<void> {
    debug('destroy method');
    const data = await UserModel.findByIdAndDelete(id);
    if (!data)
      throw new HTTPError(
        404,
        'Not found',
        'Delete not possible: ID not found '
      );
  }
}
