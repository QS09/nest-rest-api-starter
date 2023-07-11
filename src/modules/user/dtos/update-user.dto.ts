import {
  IsEmail,
  IsString,
  IsEnum,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { UserRoleEnum } from '../user.types';
import { UserStatusEnum } from '../user.types';

export class UpdateUserDto {
  /**
   * @example Cool
   */
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  readonly nickName!: string;

  /**
   * @example update@example.com
   */
  @IsOptional()
  @IsString()
  @IsEmail()
  readonly email!: string;

  /**
   * @example user
   */
  @IsOptional()
  @IsEnum(UserRoleEnum)
  readonly role?: UserRoleEnum;

  /**
   * @example 3
   */
  @IsOptional()
  @IsEnum(UserStatusEnum)
  readonly status?: UserStatusEnum;

  /**
   * @example User note
   */
  @IsOptional()
  @IsString()
  readonly note?: string;
}
