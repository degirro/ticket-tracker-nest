import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspaces as WorkspacesEntity } from 'src/utils/typeorm';
import { Notifications as NotificationsEntity } from 'src/utils/typeorm';
import { WorkspacesUsers as WorkspacesUsersEntity } from 'src/utils/typeorm';
import { User as UsersEntity } from 'src/utils/typeorm';
import { CreateWorkspacesParams } from 'src/utils/types';
import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(WorkspacesEntity)
    private readonly workspacesRepository: Repository<WorkspacesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(WorkspacesUsersEntity)
    private readonly workspacesUsersRepository: Repository<WorkspacesUsersEntity>,
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepository: Repository<NotificationsEntity>,
  ) {}

  async createWorkspaces(
    userId: number,
    createWorkspacesParams: CreateWorkspacesParams,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    createWorkspacesParams.admin = user;
    const workspace = this.workspacesRepository.create({
      ...createWorkspacesParams,
    });

    await this.workspacesRepository.save(workspace);

    const workspaceUser = this.workspacesUsersRepository.create({
      user: user,
      workspaces: workspace,
      status: 'accepted',
    });

    return await this.workspacesUsersRepository.save(workspaceUser);
  }

  async updateWorkspaceUser(userId: number, workspaceId: number) {
    const existingWorkspaceUser = await this.workspacesUsersRepository.findOne({
      where: { workspaces: { id: workspaceId }, user: { id: userId } },
    });
    if (!existingWorkspaceUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    existingWorkspaceUser.status = 'accepted';
    const notification = await this.notificationsRepository.findOne({
      where: { workspace: { id: workspaceId }, recipient: { id: userId } },
    });
    await this.notificationsRepository.remove(notification);
    return await this.workspacesUsersRepository.save(existingWorkspaceUser);
  }

  async declineWorkspaceUser(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspacesUsersRepository.findOne({
      where: { user: { id: userId }, workspaces: { id: workspaceId } },
    });

    if (!workspaceUser) {
      throw new NotFoundException(
        `User with ID ${userId} not found in workspace with ID ${workspaceId}`,
      );
    }

    const notification = await this.notificationsRepository.findOne({
      where: { workspace: { id: workspaceId }, recipient: { id: userId } },
    });
    await this.notificationsRepository.remove(notification);
    return await this.workspacesUsersRepository.remove(workspaceUser);
  }

  async addUserToWorkspace(id: number, userId: number) {
    console.log(' doing it');
    // Get workspace with given id
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const existingWorkspaceUser = await this.workspacesUsersRepository.findOne({
      where: { workspaces: { id }, user: { id: user.id } },
    });

    if (existingWorkspaceUser) {
      return workspace;
    }

    const workspaceUser = this.workspacesUsersRepository.create({
      user,
      workspaces: workspace,
      status: 'pending',
    });

    const newNotification = this.notificationsRepository.create({
      message: `Added to ${workspace.name}`,
      type: 'team',
      workspace: workspace,
      recipient: user,
    });

    return await (this.workspacesUsersRepository.save(workspaceUser),
    this.notificationsRepository.save(newNotification));
  }

  async removeUserFromWorkspace(workspaceId: number, userId: number) {
    const workspaceUser = await this.workspacesUsersRepository.findOne({
      where: { user: { id: userId }, workspaces: { id: workspaceId } },
    });

    if (!workspaceUser) {
      throw new NotFoundException(
        `User with ID ${userId} not found in workspace with ID ${workspaceId}`,
      );
    }

    return await this.workspacesUsersRepository.remove(workspaceUser);
  }

  async getUserWorkspaces(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
    });
    const userId = user.id;
    const query = this.workspacesRepository
      .createQueryBuilder('workspaces')
      .innerJoinAndSelect('workspaces.workspacesUsers', 'workspacesUsers')
      .innerJoinAndSelect('workspacesUsers.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .andWhere('workspacesUsers.status != :status', { status: 'pending' });
    return query.getMany();
  }

  async getUsers(workspaceId: number) {
    return this.workspacesUsersRepository.find({
      where: { workspaces: { id: workspaceId } },
      relations: ['user'],
      select: {
        id: true,
        status: true,
        user: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    });
  }

  async checkWorkspaceUser(id: number, userId: number): Promise<boolean> {
    // Get workspace with given id
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const existingWorkspaceUser = await this.workspacesUsersRepository.findOne({
      where: { workspaces: { id }, user: { id: user.id } },
    });

    return !!existingWorkspaceUser;
  }

  async checkWorkspaceAdmin(id: number, userId: number): Promise<boolean> {
    // Get workspace with given id
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    const isUserAdmin = await this.workspacesRepository.findOne({
      where: { admin: { id: userId } },
    });

    return !!isUserAdmin;
  }
}
