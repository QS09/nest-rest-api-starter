export enum AuthProviderEnum {
  EMAIL = 'email',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  TWITTER = 'twitter',
}

export type AuthProviderType = {
  provider: AuthProviderEnum;
  id: string;
};

export type SocialUserType = {
  socialProviderId: string;
  socialProvider: AuthProviderEnum;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;
};
