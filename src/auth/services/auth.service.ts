import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from 'src/auth/auth';
import { ValidateUserDetails } from 'src/utils/types';
import { compareHash } from 'src/utils/bcrypt/bcrypt';
import { Services } from 'src/utils/constants';
import { IUserService } from 'src/users/interfaces/User';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(userDetails: ValidateUserDetails) {
    console.log(userDetails, 'VALIDATE USER: USER DETAILS');
    const user = await this.userService.findUser(
      { username: userDetails.username },
      { selectAll: true },
    );
    console.log(user, ' Auth Service Console');
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const isPasswordValid = await compareHash(
      userDetails.password,
      user.password,
    );
    console.log(isPasswordValid);
    return isPasswordValid ? user : null;
  }
}
