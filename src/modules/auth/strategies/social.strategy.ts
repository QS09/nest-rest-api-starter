import { Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { SocialUserType } from '../auth.types';
import { AuthProviderEnum } from '../auth.types';

export class SocialStrategy {
  private provider: string;
  private code: string;

  constructor(provider: string, code: string) {
    this.provider = provider;
    this.code = code;
  }

  async validate(): Promise<SocialUserType | null> {
    try {
      if (this.provider === AuthProviderEnum.GOOGLE) {
        return this.validateGoogle();
      } else {
        throw Error('Auth provider not supported');
      }
    } catch {
      return null;
    }
  }

  async validateGoogle(): Promise<SocialUserType | null> {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      const { tokens } = await client.getToken(this.code);

      client.setCredentials(tokens);

      const { data } = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      return {
        socialProviderId: data['sub'],
        socialProvider: AuthProviderEnum.GOOGLE,
        email: data['email'],
        firstName: data['given_name'],
        lastName: data['family_name'],
        avatar: data['picture'],
      };
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }

  async validateFacebook(): Promise<SocialUserType | null> {
    // TODO: Dependency
    return Promise.resolve(null);
  }

  async validateGithub(): Promise<SocialUserType | null> {
    // TODO: Dependency
    return Promise.resolve(null);
  }

  async validateTwitter(): Promise<SocialUserType | null> {
    // TODO: Dependency
    return Promise.resolve(null);
  }
}
