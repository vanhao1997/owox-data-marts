import i18n from '../../../i18n';

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: 'Project Admin',
  editor: 'Technical User',
  viewer: 'Business User',
};

export function getRoleDisplayName(role: string): string {
  return i18n.t(`requestAccessPage.roles.${role}`, {
    defaultValue: ROLE_DISPLAY_NAMES[role] ?? role,
  });
}
