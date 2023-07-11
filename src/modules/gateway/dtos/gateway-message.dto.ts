import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GatewayMessageDto {
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

  /**
   * @example 52345624534543
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly SMSC!: string;

  /**
   * @example 635726234567
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly SCTS!: string;

  /**
   * @example Code: XXXXX
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly message!: string;
}
