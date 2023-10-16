import { User } from '../../utils/typeorm';
import {
  CreateUserParams,
  FindUserOptions,
  FindUserParams,
} from '../../utils/types';

export interface IUserService {
  createUser(userDetails: CreateUserParams): Promise<User>;
  findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User>;
  saveUser(user: User): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  findUserbyUsername(username: string): Promise<User>;
  findUserById(userId: number): Promise<User>;
}
