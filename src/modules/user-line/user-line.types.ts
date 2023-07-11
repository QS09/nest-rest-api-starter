export enum UserLineStatus {
  PENDING = 'pending', // User requested access to admin, pending approval
  ACTIVE = 'active', // User can use associated line normally
  RELEASED = 'released', // Phone number association released. Phone number will be available for other users.
  SUSPENDED = 'suspended', // Access to associated line suspended by admin
}
