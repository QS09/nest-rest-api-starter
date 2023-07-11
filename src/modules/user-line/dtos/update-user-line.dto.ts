import { IsString, IsEnum, IsOptional } from 'class-validator';
import { UserLineStatus } from '../user-line.types';
export class UpdateUserLineDto {
  /**
   * @example
   */
  @IsOptional()
  @IsEnum(UserLineStatus)
  readonly status?: UserLineStatus;

  /**
   * @example Demo Label
   */
  @IsOptional()
  @IsString()
  readonly label?: string;

  /**
   * @example Demo note
   */
  @IsOptional()
  @IsString()
  readonly note?: string;
}
