export enum UserRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatusEnum {
  PENDING = 'pending', // Default, invitation to service in pending. Can access to service after password created
  ACTIVE = 'active', // Invite accepted by user, normal access to service
  SUSPENDED = 'suspended', // Suspended by admin, can login still, readonly access to service
  BLOCKED = 'blocked', // Access blocked by admin, no access to service
}
