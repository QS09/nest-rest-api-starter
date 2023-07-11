import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GatewayQueryDto {
  /**
   * @example 61A
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly port!: string;

  /**
   * @example 1234567890
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly sender!: string;

  /**
   * @example 0987654321
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly receiver!: string;
}
