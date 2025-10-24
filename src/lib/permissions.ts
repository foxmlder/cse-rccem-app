import { UserRole } from '@prisma/client';

/**
 * Check if user has permission to perform an action
 */
export function hasPermission(userRole: UserRole, action: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    // Meeting permissions
    CREATE_MEETING: ['PRESIDENT', 'ADMIN'],
    EDIT_MEETING: ['PRESIDENT', 'ADMIN'],
    DELETE_MEETING: ['PRESIDENT', 'ADMIN'],
    SEND_CONVOCATION: ['PRESIDENT', 'ADMIN'],

    // Feedback permissions
    SUBMIT_FEEDBACK: ['PRESIDENT', 'ADMIN', 'MEMBER'],
    EDIT_OWN_FEEDBACK: ['PRESIDENT', 'ADMIN', 'MEMBER'],
    DELETE_OWN_FEEDBACK: ['PRESIDENT', 'ADMIN', 'MEMBER'],
    VIEW_ALL_FEEDBACKS: ['PRESIDENT', 'ADMIN'],

    // Minute permissions
    CREATE_MINUTE: ['PRESIDENT', 'ADMIN'],
    EDIT_MINUTE: ['PRESIDENT', 'ADMIN'],
    SIGN_MINUTE: ['PRESIDENT', 'ADMIN', 'MEMBER'],
    PUBLISH_MINUTE: ['PRESIDENT', 'ADMIN'],

    // Member permissions
    VIEW_MEMBERS: ['PRESIDENT', 'ADMIN', 'MEMBER'],
    ADD_MEMBER: ['PRESIDENT', 'ADMIN'],
    EDIT_MEMBER: ['PRESIDENT', 'ADMIN'],
    REMOVE_MEMBER: ['PRESIDENT', 'ADMIN'],
  };

  return permissions[action]?.includes(userRole) ?? false;
}

/**
 * Check if user is admin or president
 */
export function isAdminOrPresident(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'PRESIDENT';
}

/**
 * Check if user can manage meetings
 */
export function canManageMeetings(userRole: UserRole): boolean {
  return isAdminOrPresident(userRole);
}

/**
 * Check if user can manage members
 */
export function canManageMembers(userRole: UserRole): boolean {
  return isAdminOrPresident(userRole);
}
