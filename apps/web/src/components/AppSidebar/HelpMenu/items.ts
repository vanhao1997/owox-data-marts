import type { HelpMenuItem } from './types';
import { Info, Clapperboard, MessagesSquare, Rocket, Airplay, ListTodo } from 'lucide-react';
import { openIntercom } from '../../../app/intercom/intercomUtils';
import type { TFunction } from 'i18next';

export function helpMenuItems(
  openPopover: (id: string) => void,
  openSetupChecklist: () => void,
  t: TFunction
): HelpMenuItem[] {
  return [
    {
      type: 'menu-item',
      title: t('helpMenu.whatsNew'),
      icon: Rocket,
      href: 'https://docs.p2pdigital.vn/docs/changelog/?utm_source=community_edition&utm_medium=organic&utm_campaign=support_menu_dropdown&utm_content=whats_new',
      visible: true,
    },
    { type: 'separator' },
    {
      type: 'menu-item',
      title: t('helpMenu.getToKnow'),
      icon: ListTodo,
      onClick: () => {
        openSetupChecklist();
      },
      visible: true,
    },
    {
      type: 'menu-item',
      title: t('helpMenu.documentation'),
      href: 'https://docs.p2pdigital.vn/?utm_source=community_edition&utm_medium=organic&utm_campaign=support_menu_dropdown&utm_content=documentation',
      icon: Info,
      visible: { flagKey: 'MENU_DOCUMENTATION_COMMUNITY_EDITION_VISIBLE', expectedValue: 'true' },
    },
    {
      type: 'menu-item',
      title: t('helpMenu.documentation'),
      href: 'https://docs.p2pdigital.vn/?utm_source=app_p2pdigital_vn&utm_medium=organic&utm_campaign=support_menu_dropdown&utm_content=documentation',
      icon: Info,
      visible: { flagKey: 'MENU_DOCUMENTATION_OWOX_CLOUD_VISIBLE', expectedValue: 'true' },
    },
    {
      type: 'submenu',
      title: t('helpMenu.videoTutorials'),
      icon: Clapperboard,
      visible: true,
      submenu: {
        options: [
          {
            label: t('helpMenu.gettingStarted'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-3-getting-started-with-data-marts');
            },
          },
          {
            label: t('helpMenu.sqlToSheets'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-1-google-sheets');
            },
          },
          {
            label: t('helpMenu.dataStudioSetup'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-2-looker');
            },
          },
          {
            label: t('helpMenu.bigQuerySetup'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-4-legacy-storage-setup');
            },
          },
          {
            label: t('helpMenu.insightsVideo'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-5-try-insights');
            },
          },
          {
            label: t('helpMenu.emailReports'),
            icon: Airplay,
            onClick: () => {
              openPopover('video-6-email-reports');
            },
          },
        ],
      },
    },
    { type: 'separator' },
    {
      type: 'menu-item',
      title: t('helpMenu.onlineChat'),
      icon: MessagesSquare,
      onClick: () => {
        openIntercom();
      },
      visible: true,
    },
  ];
}