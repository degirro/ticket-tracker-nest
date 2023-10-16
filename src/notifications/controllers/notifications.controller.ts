import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/LocalGuard';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { NotificationsService } from '../services/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.NOTIFICATIONS)
@UseGuards(AuthenticatedGuard)
export class NotificationsController {
  constructor(
    @Inject(Services.NOTIFICATIONS)
    private readonly notificationsService: NotificationsService,
    private readonly events: EventEmitter2,
  ) {}

  @Get()
  @UsePipes(ValidationPipe)
  async getUserNotifications(@Res() res, @AuthUser() { id }: User) {
    const userNotifications =
      await this.notificationsService.getUserNotifications(id);
    if (!userNotifications)
      throw new NotFoundException('User notifications does not exist');
    return res.status(HttpStatus.OK).json(userNotifications);
  }

  @Post('/remove/:notifId')
  async removeNotifications(
    @AuthUser() { id }: User,
    @Param('notifId', ParseIntPipe) notifId: number,
  ) {
    const remove = await this.notificationsService.removeNotifications(
      id,
      notifId,
    );
    this.events.emit('notification.Change', { userId: id });

    return remove;
  }
}
