import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  /**
   * @example IamCool
   */
  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  readonly nickName!: string;

  /**
   * @example register@example.com
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email!: string;

  /**
   * @example c0010RG@#
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password!: string;
}
