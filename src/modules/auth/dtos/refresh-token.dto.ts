import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  /**
   * @example f29404a6e4c6e8da7ee794b5ea5b0976f3d8f0fdf2db3af610a4d0b4bdb1f95f8837e998f40
   */
  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;
}
