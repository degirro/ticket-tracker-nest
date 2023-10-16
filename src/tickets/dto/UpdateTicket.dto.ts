import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';
import { User } from 'src/utils/typeorm';

export class UpdateTicketDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  title: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  desc: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  priority: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  issueType: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  status: string;

  @IsNumber()
  estimation: number;

  @Type(() => User)
  users: User[];
}
