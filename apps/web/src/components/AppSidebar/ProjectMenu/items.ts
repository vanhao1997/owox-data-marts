import type { ProjectMenuItem } from './types';
import { GitHubIcon, OWOXBIIcon } from '../../../shared';
import { Gem, BadgeAlert, Scale, MessageCircle, Settings } from 'lucide-react';

export const projectMenuItems: ProjectMenuItem[] = [
  {
    type: 'menu-item',
    title: 'projectMenu.githubCommunity',
    href: 'https://github.com/p2pdigital/data-marts',
    icon: GitHubIcon,
    visible: { flagKey: 'MENU_GITHUB_COMMUNITY_VISIBLE', expectedValue: 'true' },
    group: 'community',
  },
  {
    type: 'menu-item',
    title: 'projectMenu.discoverUpgradeOptions',
    href: 'https://www.p2pdigital.vn/pricing/?utm_source=app_p2pdigital_vn&utm_medium=community_edition&utm_campaign=pricing&utm_keyword=upgrade_options&utm_content=header_dropdown',
    icon: Gem,
    visible: { flagKey: 'MENU_UPGRADE_OPTIONS_VISIBLE', expectedValue: 'true' },
    group: 'community',
  },
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
    title: 'projectMenu.leaveFeedback',
    href: 'https://github.com/p2pdigital/data-marts/discussions',
    icon: MessageCircle,
    visible: { flagKey: 'MENU_FEEDBACK_VISIBLE', expectedValue: 'true' },
    group: 'feedback',
  },
  {
    type: 'menu-item',
    title: 'projectMenu.issues',
    href: 'https://github.com/p2pdigital/data-marts/issues',
    icon: BadgeAlert,
    visible: { flagKey: 'MENU_ISSUES_VISIBLE', expectedValue: 'true' },
    group: 'feedback',
  },
  {
    type: 'menu-item',
    title: 'projectMenu.license',
    href: 'https://github.com/p2pdigital/data-marts#License-1-ov-file',
    icon: Scale,
    visible: { flagKey: 'MENU_LICENSE_VISIBLE', expectedValue: 'true' },
    group: 'legal',
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
