import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { UserModel } from '../repository/users.mongo.model';
import { dbConnect } from '../db/db.connect.js';
import { Auth, TokenPayload } from '../helpers/auth.js';

const setCollection = async () => {
  const usersMock = [
    {
      email: 'test1@test.com',
      userName: 'test1',
      password: '12345',
      picture: 'test1URL',
    },

    {
      email: 'test2@test.com',
      userName: 'test2',
      password: '12345',
      picture: 'test2URL',
    },
  ];

  await UserModel.deleteMany();
  await UserModel.insertMany(usersMock);

  const data = await UserModel.find();
  const testIds = [data[0].id, data[1].id];
  return testIds;
};

let ids: Array<string>;

describe('Given the App with /users path and connected to mongo DB', () => {
  let token: string;

  beforeEach(async () => {
    await dbConnect();
    ids = await setCollection();

    const payload: TokenPayload = {
      id: ids[0],
      userName: 'test1',
      role: 'Admin',
    };
    token = Auth.createJWT(payload);
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('When the Post method to /register path is performed', () => {
    test('Then if the information is OK, the status code should be 201', async () => {
      const registerMock = {
        email: 'test3@test.com',
        userName: 'test3',
        password: '12345',
        picture: 'test3URL',
      };
      const response = await request(app)
        .post('/users/register')
        .send(registerMock);

      expect(response.status).toBe(201);
    });

    test('Then if the information is NOK, the status code should be 401', async () => {
      const registerMock = {
        email: 'test3@test.com',
      };
      const response = await request(app)
        .post('/users/register')
        .send(registerMock);

      expect(response.status).toBe(401);
    });
  });

  describe('When the Post method to /login path is performed', () => {
    test('Then if the information is OK, the status code should be 202', async () => {
      const loginMock = {
        email: 'test4@test.com',
        userName: 'test4',
        password: '12345',
        picture: 'test4URL',
      };
      await request(app).post('/users/register').send(loginMock);
      const response = await request(app).post('/users/login').send(loginMock);

      expect(response.status).toBe(202);
    });

    test('Then if the information is NOK (miss password), the status code should be 401', async () => {
      const loginMock = {
        userName: 'test1',
      };
      const response = await request(app).post('/users/login').send(loginMock);

      expect(response.status).toBe(401);
    });
  });

  test('Then if the information is NOK (userName does not exist), the status code should be 401', async () => {
    const loginMock = {
      userName: 'test10',
      password: 'noPass',
    };
    const response = await request(app).post('/users/login').send(loginMock);

    expect(response.status).toBe(401);
  });

  test('Then if the information is NOK (password does not match), the status code should be 401', async () => {
    const loginMock = {
      userName: 'test1',
      password: 'noPass',
    };
    const response = await request(app).post('/users/login').send(loginMock);

    expect(response.status).toBe(401);
  });
});
