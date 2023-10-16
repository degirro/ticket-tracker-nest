import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications as NotificationsEntity } from 'src/utils/typeorm';
import { User as UsersEntity } from 'src/utils/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepository: Repository<NotificationsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async getUserNotifications(id: number): Promise<NotificationsEntity[]> {
    const notifications = await this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.workspace', 'workspace')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .where({ recipient: { id } })
      .getMany();

    return notifications;
  }

  async removeNotifications(userId: number, notifId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notifId },
      relations: ['recipient'],
    });

    if (notification.recipient.id === userId) {
      return await this.notificationsRepository.remove(notification);
    } else {
      throw new NotFoundException(
        `Not authorized to delete Notification: ${notifId}`,
      );
    }
  }
}
