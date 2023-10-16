import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticatedSocket } from '../utils/interfaces';
import { SessionEntity, User } from '../utils/typeorm';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { INestApplicationContext } from '@nestjs/common';
import { Server } from 'socket.io';

export class WebsocketAdapter extends IoAdapter {
  private sessionRepository: Repository<SessionEntity>;

  constructor(private readonly app: INestApplicationContext) {
    super(app);
    this.sessionRepository = this.app
      .get(DataSource)
      .getRepository(SessionEntity);
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next: any) => {
      const { cookie: clientCookie } = socket.handshake.headers;

      if (!clientCookie) {
        console.log('Client has no cookies');
        return next(new Error('Not Authenticated. No cookies were sent'));
      }

      const { SESSION_ID } = cookie.parse(clientCookie);

      if (!SESSION_ID) {
        console.log('SESSION_ID DOES NOT EXIST');
        return next(new Error('Not Authenticated'));
      }

      const signedCookie = cookieParser.signedCookie(
        SESSION_ID,
        process.env.COOKIE_SECRET,
      );

      if (!signedCookie) {
        return next(new Error('Error signing cookie'));
      }

      const sessionDB = await this.sessionRepository.findOne({
        where: { id: signedCookie },
      });
      if (!sessionDB) {
        return next(new Error('No session found'));
      }

      const userFromJson = JSON.parse(sessionDB.json);

      if (!userFromJson.passport || !userFromJson.passport.user) {
        return next(new Error('Passport or User object does not exist.'));
      }

      const userDB = plainToInstance(
        User,
        JSON.parse(sessionDB.json).passport.user,
      );
      socket.user = userDB;
      next();
    });

    return server;
  }
}
