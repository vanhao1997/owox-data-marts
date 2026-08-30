import { DataMartDefinitionType } from '../enums/data-mart-definition-type.enum';
import { Code, Table, Grip, Asterisk, Plug } from 'lucide-react';
import i18n from '../../../../i18n';
import type { TFunction } from 'i18next';

export interface DataMartDefinitionTypeInfo {
  type: DataMartDefinitionType | null;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DataMartDefinitionTypeConfig {
  type: DataMartDefinitionType;
  displayNameKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DataMartDefinitionTypeModel = {
  types: {
    [DataMartDefinitionType.SQL]: {
      type: DataMartDefinitionType.SQL,
      displayNameKey: 'dataMartDefinitionType.sql',
      icon: Code,
    },
    [DataMartDefinitionType.TABLE]: {
      type: DataMartDefinitionType.TABLE,
      displayNameKey: 'dataMartDefinitionType.table',
      icon: Table,
    },
    [DataMartDefinitionType.VIEW]: {
      type: DataMartDefinitionType.VIEW,
      displayNameKey: 'dataMartDefinitionType.view',
      icon: Grip,
    },
    [DataMartDefinitionType.TABLE_PATTERN]: {
      type: DataMartDefinitionType.TABLE_PATTERN,
      displayNameKey: 'dataMartDefinitionType.pattern',
      icon: Asterisk,
    },
    [DataMartDefinitionType.CONNECTOR]: {
      type: DataMartDefinitionType.CONNECTOR,
      displayNameKey: 'dataMartDefinitionType.connector',
      icon: Plug,
    },
  } satisfies Record<DataMartDefinitionType, DataMartDefinitionTypeConfig>,
  getInfo(type: DataMartDefinitionType | null, t?: TFunction): DataMartDefinitionTypeInfo {
    if (!type) {
      return {
        type: null,
        displayName: '—',
        icon: () => null,
      };
    }
    const info = this.types[type] as DataMartDefinitionTypeConfig | undefined;
    // Fall back for enum values the FE build does not know yet — an undefined
    // info object would crash badge consumers on `info.icon`.
    if (!info) {
      return {
        type: null,
        displayName: '\u2014',
        icon: () => null,
      };
    }

    return {
      type: info.type,
      displayName: (t ?? i18n.t.bind(i18n))(info.displayNameKey, info.type),
      icon: info.icon,
    };
  },
};
