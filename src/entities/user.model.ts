export type UserStructure = {
  id: string;
  email: string;
  userName: string;
  password: string;
  friends: UserStructure[];
  enemies: UserStructure[];
};
