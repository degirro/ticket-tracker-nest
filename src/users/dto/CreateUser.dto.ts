import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsEmail,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  username: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  firstName: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  lastName: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{"':;?\/>.<,])(?=.*[a-z]).{8,}$/,
  )
  password: string;
}
