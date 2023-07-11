import {
  IsEmail,
  IsString,
  IsEnum,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { UserRoleEnum } from '../user.types';

export class CreateUserDto {
  /**
   * @example Cool
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  readonly nickName!: string;

  /**
   * @example new@example.com
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email!: string;

  /**
   * @example user
   */
  @IsOptional()
  @IsEnum(UserRoleEnum)
  readonly role: UserRoleEnum;

  /**
   * @example User note
   */
  @IsOptional()
  @IsString()
  readonly note: string;
}
