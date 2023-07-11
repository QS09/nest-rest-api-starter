import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { LineStatus } from '../line.types';

export class ImportLineDto {
  /**
   * @example file
   */
  @ApiProperty({ type: 'string', format: 'binary' })
  readonly file!: any;

  /**
   * @example pending
   */
  @IsOptional()
  @IsEnum(LineStatus)
  readonly status?: LineStatus;

  /**
   * @example Demo note.
   */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly note?: string;
}
