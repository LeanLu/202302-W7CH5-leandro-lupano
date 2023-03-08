export type UserStructure = {
  id: string;
  email: string;
  userName: string;
  password: string;
  picture: string;
  friends: UserStructure[];
  enemies: UserStructure[];
};
