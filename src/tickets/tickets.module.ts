import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { Services } from 'src/utils/constants';
import {
  Notifications,
  Tickets,
  User,
  Workspaces,
  WorkspacesUsers,
} from 'src/utils/typeorm';
import { TicketsController } from './controllers/tickets.controller';
import { TicketsService } from './services/tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tickets,
      Workspaces,
      User,
      Notifications,
      WorkspacesUsers,
    ]),
  ],
  controllers: [TicketsController],
  providers: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
    {
      provide: Services.TICKETS,
      useClass: TicketsService,
    },
  ],
  exports: [
    {
      provide: Services.TICKETS,
      useClass: TicketsService,
    },
  ],
})
export class TicketsModule {}
