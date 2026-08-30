import { DataMartStatus } from '../enums';
import i18n from '../../../../i18n';
import type { TFunction } from 'i18next';

export interface DataMartStatusInfo {
  code: DataMartStatus;
  displayName: string;
  description: string;
}

interface DataMartStatusConfig {
  code: DataMartStatus;
  displayNameKey: string;
  descriptionKey: string;
}

export const DataMartStatusModel = {
  statuses: {
    [DataMartStatus.DRAFT]: {
      code: DataMartStatus.DRAFT,
      displayNameKey: 'dataMartStatus.draft',
      descriptionKey: 'dataMartStatus.draftDescription',
    },
    [DataMartStatus.PUBLISHED]: {
      code: DataMartStatus.PUBLISHED,
      displayNameKey: 'dataMartStatus.published',
      descriptionKey: 'dataMartStatus.publishedDescription',
    },
  } satisfies Record<DataMartStatus, DataMartStatusConfig>,

  getInfo(status: DataMartStatus, t?: TFunction): DataMartStatusInfo {
    const info = this.statuses[status];
    const translate = t ?? i18n.t.bind(i18n);
    return {
      code: info.code,
      displayName: translate(info.displayNameKey, info.code),
      description: translate(info.descriptionKey, ''),
    };
  },

  getAllStatuses(): DataMartStatusInfo[] {
    return Object.keys(this.statuses).map(status => this.getInfo(status as DataMartStatus));
  },
} as const;
