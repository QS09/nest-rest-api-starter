import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { UserLineStatus } from '../user-line.types';

export class CreateBulkUserLineDto {
  /**
   * @example 123e4567-e89b-12d3-a456-426614174000
   */
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  /**
   * @example [123e4567-e89b-12d3-a456-426614174000]
   */
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  readonly lineIds!: string[];

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
