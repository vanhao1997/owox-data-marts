import type { ProjectMenuItem } from './types';
import { OWOXBIIcon } from '../../../shared';
import { Settings } from 'lucide-react';

export const projectMenuItems: ProjectMenuItem[] = [
  {
    type: 'project-settings-submenu',
    title: 'projectMenu.projectSettings',
    href: '',
    icon: Settings,
    visible: true,
    group: 'project',
  },
  {
    type: 'menu-item',
    title: 'projectMenu.owoxBi',
    href: 'https://p2pdigital.vn/',
    icon: OWOXBIIcon,
    visible: { flagKey: 'MENU_OWOX_BI_VISIBLE', expectedValue: 'true' },
    group: 'external',
  },
];
