import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActivateDto {
  /**
   * @example Cool
   */
  @IsNotEmpty()
  @IsString()
  readonly nickName!: string;

  /**
   * @example activate@example.com
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email!: string;

  /**
   * @example c001SMSnet!@#
   */
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
