import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { Services } from 'src/utils/constants';
import {
  Notifications,
  User,
  Workspaces,
  WorkspacesUsers,
} from 'src/utils/typeorm';
import { WorkspacesController } from './controllers/workspaces.controller';
import { WorkspacesService } from './services/workspaces.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspaces,
      User,
      WorkspacesUsers,
      Notifications,
    ]),
  ],
  controllers: [WorkspacesController],
  providers: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
    {
      provide: Services.WORKSPACES,
      useClass: WorkspacesService,
    },
  ],
  exports: [
    {
      provide: Services.WORKSPACES,
      useClass: WorkspacesService,
    },
  ],
})
export class WorkspacesModule {}
