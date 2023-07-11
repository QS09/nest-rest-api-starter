import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserLineStatus } from '../user-line.types';

export class CreateUserLineDto {
  /**
   * @example 123e4567-e89b-12d3-a456-426614174000
   */
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  /**
   * @example 123e4567-e89b-12d3-a456-426614174000
   */
  @IsNotEmpty()
  @IsString()
  readonly lineId!: string;

  /**
   * @example pending
   */
  @IsNotEmpty()
  @IsEnum(UserLineStatus)
  readonly status!: UserLineStatus;

  /**
   * @example Demo note.
   */
  @IsOptional()
  @IsString()
  readonly note?: string;
}
