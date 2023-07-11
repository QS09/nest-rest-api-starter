import { IsBoolean, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  /**
   * @example Demo message.
   */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly message?: string;

  /**
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  readonly isVisible!: boolean;

  /**
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  readonly isRead!: boolean;
}
