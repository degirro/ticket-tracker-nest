import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Tickets as TicketsEntity } from 'src/utils/typeorm';
import { Workspaces as WorkspacesEntity } from 'src/utils/typeorm';
import { Notifications as NotificationsEntity } from 'src/utils/typeorm';
import { User as UsersEntity } from 'src/utils/typeorm';
import { WorkspacesUsers as WorkspacesUsersEntity } from 'src/utils/typeorm';
import { CreateTicketsParams, UpdateTicketParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketsEntity)
    private readonly ticketsRepository: Repository<TicketsEntity>,
    @InjectRepository(WorkspacesEntity)
    private readonly workspacesRepository: Repository<WorkspacesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(WorkspacesUsersEntity)
    private readonly workspacesUsersRepository: Repository<WorkspacesUsersEntity>,
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepository: Repository<NotificationsEntity>,
    private readonly events: EventEmitter2,
  ) {}

  async createTickets(id: number, createTicketsParams: CreateTicketsParams) {
    const newTickets = this.ticketsRepository.create({
      workspaceId: id,
      ...createTicketsParams,
      users: createTicketsParams.users,
    });

    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });

    const notifications = [];

    for (const user of createTicketsParams.users) {
      const notification = this.notificationsRepository.create({
        message: `Added to Ticket: ${createTicketsParams.title}`,
        type: 'ticket',
        workspace: workspace,
        recipient: user,
      });

      notifications.push(notification);
      await this.notificationsRepository.save(notification);
      this.events.emit('notification.Change', { userId: user.id });
    }

    return await this.ticketsRepository.save(newTickets);
  }

  async getWorkspaceTickets(id: number) {
    const workspace = await this.workspacesRepository
      .createQueryBuilder('workspace')
      .innerJoinAndSelect('workspace.workspacesUsers', 'workspacesUsers')
      .innerJoinAndSelect('workspacesUsers.user', 'user')
      .leftJoinAndSelect('workspace.tickets', 'ticket')
      .leftJoinAndSelect('ticket.users', 'ticket_users')
      .where('workspace.id = :id', { id })
      .getOne();

    return workspace;
  }

  async getUserTickets(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        'workspacesUsers',
        'workspacesUsers.workspaces',
        'workspacesUsers.workspaces.tickets',
      ],
    });
    if (!user) throw new NotFoundException(`User not found`);

    const query = this.workspacesRepository
      .createQueryBuilder('workspaces')
      .leftJoinAndSelect('workspaces.tickets', 'tickets')
      .leftJoinAndSelect('tickets.users', 'users')
      .andWhere('users.id = :userId', { userId: user.id })
      .select([
        'workspaces',
        'tickets',
        'users.id',
        'users.username',
        'users.email',
        'users.firstName',
        'users.lastName',
      ]);

    const workspaces = await query.getMany();

    return workspaces;
  }

  async updateTicket(updateTicketParams: UpdateTicketParams) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: updateTicketParams.id },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Ticket with ID ${updateTicketParams.id} not found`,
      );
    }

    ticket.title = updateTicketParams.title;
    ticket.desc = updateTicketParams.desc;
    ticket.priority = updateTicketParams.priority;
    ticket.issueType = updateTicketParams.issueType;
    ticket.status = updateTicketParams.status;
    ticket.estimation = updateTicketParams.estimation;

    await this.ticketsRepository.save(ticket);

    return ticket;
  }

  async searchWorkspaceTickets(
    id: number,
    userId: number,
    status?: string,
    userTickets?: boolean,
  ) {
    const query = this.workspacesRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.tickets', 'ticket')
      .leftJoinAndSelect('ticket.users', 'ticket_users')
      .where('workspace.id = :id', { id });

    if (status && status.toLowerCase() !== 'resolved') {
      query.andWhere('LOWER(ticket.status) = :status', {
        status: status,
      });
    }

    if (userTickets === true) {
      query.andWhere('ticket_users.id = :userId', { userId });
    }

    const workspace = await query.getOne();

    return workspace;
  }
}
