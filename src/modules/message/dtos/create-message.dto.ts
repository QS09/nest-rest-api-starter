import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  /**
   * @example 1234567890
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly receiver!: string;

  /**
   * @example 1234567890
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly sender!: string;

  /**
   * @example Code: XXXXX
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly message!: string;

  /**
   * @example smsc
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly smsc!: string;

  /**
   * @example scts
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly scts!: string;

  /**
   * @example 29A
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly port!: string;
}
