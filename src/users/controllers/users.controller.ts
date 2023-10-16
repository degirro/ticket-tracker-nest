import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { UsersService } from '../services/users.service';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private readonly usersService: UsersService,
  ) {}

  @Get('/username/:username')
  @UsePipes(ValidationPipe)
  async getWorkspaceTickets(@Res() res, @Param('username') username: string) {
    const user = await this.usersService.findUserbyUsername(username);
    if (!user) throw new NotFoundException('User tickets does not exist');
    return res.status(HttpStatus.OK).json(user);
  }

  @Get('/auth/:username')
  @UsePipes(ValidationPipe)
  async checkUserGuard(
    @Res() res,
    @AuthUser() { id }: User,
    @Param('username') username: string,
  ) {
    const checkUser = await this.usersService.checkUserGuard(id, username);
    console.log(checkUser);
    return res.status(HttpStatus.OK).json(checkUser);
  }
}
