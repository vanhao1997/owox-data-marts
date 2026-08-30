import { ScheduledTriggerType } from '../enums';
import i18n from '../../../../i18n';

const SCHEDULED_TRIGGER_TYPE_LABELS: Record<string, string> = {
  [ScheduledTriggerType.REPORT_RUN]: 'Report Run',
  [ScheduledTriggerType.CONNECTOR_RUN]: 'Connector Run',
  [ScheduledTriggerType.DATA_QUALITY_RUN]: 'Data Quality Run',
};

export function getScheduledTriggerTypeLabel(type: string): string {
  const keyByType: Record<string, string> = {
    [ScheduledTriggerType.REPORT_RUN]: 'scheduledTriggerUi.reportRun',
    [ScheduledTriggerType.CONNECTOR_RUN]: 'scheduledTriggerUi.connectorRun',
    [ScheduledTriggerType.DATA_QUALITY_RUN]: 'scheduledTriggerUi.qualityRun',
  };
  return keyByType[type] ? i18n.t(keyByType[type], SCHEDULED_TRIGGER_TYPE_LABELS[type]) : type;
}
