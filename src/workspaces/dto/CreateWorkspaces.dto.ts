import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Tickets } from 'src/utils/typeorm';
import { User } from 'src/utils/typeorm/entities/User';

export class CreateWorkspacesDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  @IsString()
  name: string;

  @Type(() => User)
  admin: User;

  @Type(() => User)
  users: User[];
}
