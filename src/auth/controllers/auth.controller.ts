import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticatedGuard, LocalAuthGuard } from 'src/auth/utils/LocalGuard';
import { Request, Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { Routes, Services } from 'src/utils/constants';
import { IUserService } from 'src/users/interfaces/User';
import { IAuthService } from 'src/auth/auth';
import { AuthenticatedRequest } from 'src/utils/types';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res() res: Response) {
    return res.sendStatus(HttpStatus.OK);
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  async registerUser(@Body() createUserParams: CreateUserDto) {
    return instanceToPlain(await this.userService.createUser(createUserParams));
  }

  @Get('')
  async getAuthSession(@Session() session: Record<string, any>) {
    session.authenticated = true;
    return session;
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  async status(@Req() req: Request, @Res() res: Response) {
    res.send(req.user);
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    req.logout((err) => {
      return err ? res.sendStatus(400) : res.sendStatus(200);
    });
  }
}
