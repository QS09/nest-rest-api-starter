import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  /**
   * @example verify@example.com
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email!: string;
}
