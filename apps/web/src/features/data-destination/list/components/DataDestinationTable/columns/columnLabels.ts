import { DataDestinationColumnKey } from './columnKeys';
import type { TFunction } from 'i18next';

export const dataDestinationColumnLabels: Record<DataDestinationColumnKey, string> = {
  [DataDestinationColumnKey.TITLE]: 'Title',
  [DataDestinationColumnKey.TYPE]: 'Type',
  [DataDestinationColumnKey.CREATED_AT]: 'Created At',
  [DataDestinationColumnKey.CREATED_BY]: 'Created By',
  [DataDestinationColumnKey.OWNERS]: 'Owners',
  [DataDestinationColumnKey.CONTEXTS]: 'Contexts',
};

export function getDataDestinationColumnLabels(
  t: TFunction
): Record<DataDestinationColumnKey, string> {
  return {
    [DataDestinationColumnKey.TITLE]: t('common.title'),
    [DataDestinationColumnKey.TYPE]: t('common.type'),
    [DataDestinationColumnKey.CREATED_AT]: t('common.createdAt'),
    [DataDestinationColumnKey.CREATED_BY]: t('common.createdBy'),
    [DataDestinationColumnKey.OWNERS]: t('destinationTableColumns.owners', 'Owners'),
    [DataDestinationColumnKey.CONTEXTS]: t('dataMartTableColumns.contexts', 'Contexts'),
  };
}
