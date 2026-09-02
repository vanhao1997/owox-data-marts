import { XCircle, AlertCircle, Info, AlertTriangle, CalendarClock, SquarePlay } from 'lucide-react';
import { LogLevel } from './types';
import { DataMartRunTriggerType } from '../../../shared';

export function getLogLevelIcon(level: LogLevel) {
  switch (level) {
    case LogLevel.INFO:
      return <Info className='h-3 w-3 text-blue-500' />;
    case LogLevel.WARNING:
      return <AlertTriangle className='h-3 w-3 text-yellow-500' />;
    case LogLevel.ERROR:
      return <XCircle className='h-3 w-3 text-red-500' />;
    case LogLevel.SYSTEM:
      return <AlertCircle className='text-muted-foreground h-3 w-3' />;
    default:
      return <Info className='text-muted-foreground h-3 w-3' />;
  }
}

export function getLogLevelColor(level: LogLevel) {
  switch (level) {
    case LogLevel.INFO:
      return 'text-blue-600 dark:text-blue-400';
    case LogLevel.WARNING:
      return 'text-yellow-600 dark:text-yellow-400';
    case LogLevel.ERROR:
      return 'text-red-600 dark:text-red-400';
    case LogLevel.SYSTEM:
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
}

export function getTriggerTypeIcon(triggerType: DataMartRunTriggerType | null) {
  const iconSize = 18;

  return triggerType === DataMartRunTriggerType.SCHEDULED ? (
    <CalendarClock size={iconSize} />
  ) : (
    <SquarePlay size={iconSize} />
  );
}
