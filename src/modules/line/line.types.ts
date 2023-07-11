export enum LineStatus {
  PENDING = 'pending', // Default, not ready to use
  AVAILABLE = 'available', // Available to allocate to a user
  ALLOCATED = 'allocated', // Line is assigned to a user
  SUSPENDED = 'suspended', // Suspended by admin
}
