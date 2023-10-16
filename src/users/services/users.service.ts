import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserService } from 'src/users/interfaces/User';
import { hashPassword } from 'src/utils/bcrypt/bcrypt';
import { User as UserEntity } from 'src/utils/typeorm';
import {
  CreateUserParams,
  FindUserOptions,
  FindUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userDetails: CreateUserParams) {
    const username = userDetails.username;
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const password = await hashPassword(userDetails.password);
    const params = { ...userDetails, password };
    const newUser = await this.userRepository.create(params);
    return this.userRepository.save(newUser);
  }

  async findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<UserEntity> {
    if (!options?.selectAll) {
      return this.userRepository.findOne({
        where: { username: findUserParams.username },
        select: ['id', 'username', 'email', 'firstName', 'lastName'],
      });
    } else {
      return this.userRepository.findOne({
        where: { username: findUserParams.username },
        select: [
          'id',
          'username',
          'email',
          'firstName',
          'lastName',
          'password',
        ],
      });
    }
  }

  async findUserId(findUserParams: FindUserParams): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id: findUserParams.id },
    });
  }

  async findUserById(userId: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async findUserbyUsername(username: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { username: username },
    });
  }

  async saveUser(user: UserEntity) {
    return this.userRepository.save(user);
  }

  async searchUsers(query: string) {
    const statement = '(user.username LIKE :query)';
    return this.userRepository
      .createQueryBuilder('user')
      .where(statement, { query: `%${query}%` })
      .limit(10)
      .select([
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.id',
      ])
      .getMany();
  }

  async checkUserGuard(userId: number, userURLParam: string) {
    const userFromParam = await this.userRepository.findOne({
      where: { username: userURLParam },
    });
    if (!userFromParam)
      throw new HttpException('User not found', HttpStatus.CONFLICT);
    if (userId === userFromParam.id) return true;
    throw new HttpException('User does not match', HttpStatus.CONFLICT);
  }
}
