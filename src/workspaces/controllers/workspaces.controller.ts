import {
  Controller,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  Body,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common/decorators';
import { AuthenticatedGuard } from 'src/auth/utils/LocalGuard';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateWorkspacesDto } from '../dto/CreateWorkspaces.dto';
import { WorkspacesService } from '../services/workspaces.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from 'src/users/services/users.service';

@Controller(Routes.WORKSPACES)
@UseGuards(AuthenticatedGuard)
export class WorkspacesController {
  constructor(
    @Inject(Services.WORKSPACES)
    private readonly workspacesService: WorkspacesService,
    @Inject(Services.USERS)
    private readonly usersService: UsersService,
    private readonly events: EventEmitter2,
  ) {}

  @Post('')
  async createWorkspaces(
    @AuthUser() { id }: User,
    @Body() createWorkspacesDto: CreateWorkspacesDto,
  ) {
    return await this.workspacesService.createWorkspaces(
      id,
      createWorkspacesDto,
    );
  }

  @Post('/add/:id/:username')
  async addUserToWorkspace(
    @Param('id', ParseIntPipe) id: number,
    @Param('username') username: string,
  ) {
    const user = await this.usersService.findUserbyUsername(username);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const userId = user.id;
    const addUserWorkspace = await this.workspacesService.addUserToWorkspace(
      id,
      userId,
    );
    this.events.emit('notification.Change', { userId });
    return addUserWorkspace;
  }

  @Post('/update/:workspaceId')
  @UsePipes(ValidationPipe)
  async updateWorkspaceUser(
    @AuthUser() { id }: User,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    const userWorkspaces = await this.workspacesService.updateWorkspaceUser(
      id,
      workspaceId,
    );
    this.events.emit('workspaceUser.get', userWorkspaces, {
      workspaceId,
    });
    this.events.emit('notification.Change', { userId: id });
    return userWorkspaces;
  }

  @Post('/decline/:workspaceId')
  @UsePipes(ValidationPipe)
  async declineWorkspaceUser(
    @AuthUser() { id }: User,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    const userWorkspaces = await this.workspacesService.declineWorkspaceUser(
      id,
      workspaceId,
    );
    this.events.emit('notification.Change', { userId: id });
    return userWorkspaces;
  }

  @Post('/remove/:workspaceId/:id')
  async removeUserFromWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userWorkspaces = await this.workspacesService.removeUserFromWorkspace(
      workspaceId,
      id,
    );
    this.events.emit('workspaceUser.get', userWorkspaces, {
      workspaceId,
    });
    this.events.emit('userWorkspaces.get', { userId: id });
    return userWorkspaces;
  }

  @Get('/users/:id')
  @UsePipes(ValidationPipe)
  async getUsers(@Res() res, @Param('id', ParseIntPipe) id: number) {
    const users = await this.workspacesService.getUsers(id);
    if (!users) throw new NotFoundException('No users exist');
    return res.status(HttpStatus.OK).json(users);
  }

  @Get()
  @UsePipes(ValidationPipe)
  async getUserWorkspaces(@Res() res, @AuthUser() { username }: User) {
    const userWorkspaces = await this.workspacesService.getUserWorkspaces(
      username,
    );
    if (!userWorkspaces)
      throw new NotFoundException('User workspaces does not exist');
    return res.status(HttpStatus.OK).json(userWorkspaces);
  }

  @Get('/auth/:workspaceId')
  @UsePipes(ValidationPipe)
  async checkWorkspaceUser(
    @Res() res,
    @AuthUser() { id }: User,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    const isWorkspaceUser = await this.workspacesService.checkWorkspaceUser(
      workspaceId,
      id,
    );
    if (!isWorkspaceUser)
      throw new NotFoundException('User does not exist in workspace');
    return res.status(HttpStatus.OK).json(isWorkspaceUser);
  }

  @Get('/auth/admin/:workspaceId')
  @UsePipes(ValidationPipe)
  async checkWorkspaceAdmin(
    @Res() res,
    @AuthUser() { id }: User,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    const isWorkspaceUser = await this.workspacesService.checkWorkspaceAdmin(
      workspaceId,
      id,
    );
    if (!isWorkspaceUser) throw new NotFoundException('User is not admin');
    return res.status(HttpStatus.OK).json(isWorkspaceUser);
  }
}
