import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { AuthProviderEnum } from '../auth.types';

export class SocialAuthDto {
  @IsNotEmpty()
  @IsEnum(AuthProviderEnum)
  readonly provider: AuthProviderEnum;

  /**
   * The code which you will get from social oauth response
   */
  @ValidateIf((o) => o.provider)
  @IsNotEmpty()
  @IsString()
  readonly code?: string;
}
