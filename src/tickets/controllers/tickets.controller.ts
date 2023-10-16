import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { CreateTicketsDto } from '../dto/CreateTickets.dto';
import { TicketsService } from '../services/tickets.service';
import { User } from 'src/utils/typeorm';
import { AuthenticatedGuard } from 'src/auth/utils/LocalGuard';
import { AuthUser } from 'src/utils/decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from 'src/users/services/users.service';
import { UpdateTicketDto } from '../dto/UpdateTicket.dto';

@Controller(Routes.TICKETS)
@UseGuards(AuthenticatedGuard)
export class TicketsController {
  constructor(
    @Inject(Services.TICKETS) private readonly ticketsService: TicketsService,
    @Inject(Services.USERS) private readonly usersService: UsersService,
    private readonly events: EventEmitter2,
  ) {}

  @Post('/create/:id')
  async createTickets(
    @Body()
    createTicketsDto: CreateTicketsDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const workspaceTickets = await this.ticketsService.createTickets(
      id,
      createTicketsDto,
    );
    this.events.emit('workspaceTickets.add', workspaceTickets, {
      id,
    });
    return workspaceTickets;
  }

  @Get()
  @UsePipes(ValidationPipe)
  async getUserTickets(@Res() res, @AuthUser() { id }: User) {
    const userTickets = await this.ticketsService.getUserTickets(id);
    if (!userTickets)
      throw new NotFoundException('User tickets does not exist');
    return res.status(HttpStatus.OK).json(userTickets);
  }

  @Post('/update/:id')
  async updateTicket(
    @Body()
    updateTicketDto: UpdateTicketDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const workspaceTickets = await this.ticketsService.updateTicket(
      updateTicketDto,
    );
    this.events.emit('workspaceTickets.add', workspaceTickets, {
      id,
    });
    return workspaceTickets;
  }

  @Get('/workspace-tickets/:id')
  @UsePipes(ValidationPipe)
  async getWorkspaceTickets(
    @Res() res,
    @AuthUser() { id: userId }: User,
    @Param('id') id: number,
    @Query('status') status?: string,
    @Query('userTickets') userTickets?: boolean,
  ) {
    const workspaceTickets = await this.ticketsService.searchWorkspaceTickets(
      id,
      userId,
      status,
      userTickets,
    );
    if (!workspaceTickets)
      throw new NotFoundException('User tickets do not exist');
    return res.status(HttpStatus.OK).json(workspaceTickets);
  }
}
