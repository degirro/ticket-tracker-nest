import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { Notifications, User } from 'src/utils/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications, User])],
  controllers: [NotificationsController],
  providers: [
    {
      provide: Services.NOTIFICATIONS,
      useClass: NotificationsService,
    },
  ],
  exports: [
    {
      provide: Services.NOTIFICATIONS,
      useClass: NotificationsService,
    },
  ],
})
export class NotificationsModule {}
