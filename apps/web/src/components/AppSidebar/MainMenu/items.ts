import {
  ArchiveRestore,
  Box,
  CalendarClock,
  DatabaseIcon,
  FileText,
  HistoryIcon,
  Network,
  Bookmark,
} from 'lucide-react';
import type { MainMenuItem } from './types';

export const MainMenuItems: MainMenuItem[] = [
  {
    title: 'sidebar.dataMarts',
    url: '/data-marts',
    icon: Box,
    children: [
      {
        title: 'sidebar.models',
        url: '/data-marts/models',
        icon: Network,
      },
      {
        title: 'sidebar.reports',
        url: '/data-marts/reports',
        icon: FileText,
      },
      {
        title: 'sidebar.insights',
        url: '/data-marts/insights',
        icon: Bookmark,
      },
      {
        title: 'sidebar.triggers',
        url: '/data-marts/schedules',
        icon: CalendarClock,
      },
      {
        title: 'sidebar.runHistory',
        url: '/data-marts/runs',
        icon: HistoryIcon,
      },
    ],
  },
  {
    title: 'sidebar.storages',
    url: '/data-storages',
    icon: DatabaseIcon,
  },
  {
    title: 'sidebar.destinations',
    url: '/data-destinations',
    icon: ArchiveRestore,
  },
];